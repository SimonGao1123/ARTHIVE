# frozen_string_literal: true

class GraphqlController < ApplicationController
  # JSON API authenticated by the httpOnly `authToken` cookie. Rails' CSRF
  # token flow doesn't apply here, and `null_session` would wipe the cookie
  # jar on every tokenless POST (emptying `cookies[]`). CSRF is instead
  # covered by `SameSite=Lax` on the auth cookie.
  skip_forgery_protection

  # CSRF defense-in-depth alongside SameSite=Lax: reject cross-site POSTs.
  before_action :verify_request_origin

  def execute
    if cookies[:authToken].present? && cookies[:refreshToken].blank?
      cookies.delete(:authToken, path: "/")
      return render json: { errors: [{ message: "INVALID_TOKEN" }], data: nil }
    end
    variables = prepare_variables(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]

    # auth lives entirely in the httpOnly cookie set by the login mutation
    token = cookies[:authToken]
    token = nil if token.blank?

    current_user = nil
    auth_error = nil

    # decode the token and set the current user if valid
    if token.present?
      begin
        payload = JsonWebToken.decode(token)
        current_user = User.find_by(id: payload['user_id'])

        if current_user.blank?
          auth_error = 'USER_NOT_FOUND'
        elsif !payload['token_version'].present? || current_user.token_version.to_i != payload['token_version'].to_i
          auth_error = 'INVALID_TOKEN'
          current_user = nil
        end
        
      rescue JWT::ExpiredSignature
        # The RefreshSession mutation is the way OUT of an expired session,
        # so it must be allowed through even when the access JWT is expired.
        # For everything else, short-circuit with EXPIRED_TOKEN so the
        # frontend error link picks it up and triggers refresh.
        if operation_name == "RefreshSession"
          auth_error = 'EXPIRED_TOKEN'
        else
          render json: { errors: [{ message: 'EXPIRED_TOKEN' }], data: nil }
          return
        end
      rescue JWT::DecodeError
        auth_error = 'INVALID_TOKEN'
      end
    else
      auth_error = 'NO_TOKEN'
    end

    # INVALID_TOKEN / USER_NOT_FOUND are unrecoverable: tampered JWT, or a
    # token_version bump (which ALSO revoked the matching refresh tokens), or
    # the user was deleted. Refresh can't help and would actually trigger a
    # false-positive REFRESH_REUSE if the user tries it. Clear both cookies
    # so the next request is a clean anonymous one.
    # NO_TOKEN: not cleared (no cookies to clear, and would spam every
    # anonymous visitor with Set-Cookie headers).
    # EXPIRED_TOKEN: not cleared — it's the refresh trigger.
    if %w[INVALID_TOKEN USER_NOT_FOUND].include?(auth_error)
      cookies.delete(:authToken, path: "/")
      cookies.delete(:refreshToken, path: "/")
    end

    ActiveStorage::Current.url_options = { host: request.host, port: request.port, protocol: request.protocol }

    context = {
      current_user: current_user,
      request: request,
      auth_error: auth_error
    }
    
    result = ArthiveBackendSchema.execute(query, variables: variables, context: context, operation_name: operation_name)

    # commit auth-cookie side-effects emitted by login/logout resolvers
    if jwt = result.context[:set_auth_cookie]
      # TODO prod: when frontend + api share a parent domain, add `domain: ".arthive.com"`.
      # If they end up on totally separate registrable domains, switch to
      # `same_site: :none, secure: true` (requires HTTPS).
      # Cookie lifetime matches the refresh cookie (30 days) — the JWT's own
       # `exp` claim (15 min) governs validity; the cookie just has to outlive
       # the refresh window so it can carry the JWT through silent rotations.
      cookies[:authToken] = {
        value: jwt,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :lax,
        expires: 30.days.from_now,
        path: "/",
      }
    end
    if result.context[:clear_auth_cookie]
      cookies.delete(:authToken, path: "/")
    end

    # for the refresh token, we use a separate cookie
    if raw_refresh = result.context[:set_refresh_cookie]
      cookies[:refreshToken] = {
        value: raw_refresh,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :lax,
        expires: 30.days.from_now,
        path: "/",
      }
    end
    if result.context[:clear_refresh_cookie]
      cookies.delete(:refreshToken, path: "/")
    end
    render json: result
  rescue StandardError => e
    raise e unless Rails.env.development?
    handle_error_in_development(e)
  end

  private

  # A browser always sends Origin on a cross-site POST and JS cannot forge it,
  # so a forged request from another site is rejected here. A blank Origin
  # means it isn't a browser cross-site call (server-to-server, curl), which
  # is not a CSRF vector, so it's allowed through. Mirrors the CORS allow-list.
  def verify_request_origin
    origin = request.headers["Origin"]
    return if origin.blank?
    return if allowed_origins.include?(origin)

    render json: { errors: [{ message: "FORBIDDEN_ORIGIN" }], data: nil }, status: :forbidden
  end

  def allowed_origins
    [
      "http://localhost:5173",
      "http://localhost:5174",
      ENV["FRONTEND_URL"],
    ].compact_blank
  end

  # Handle variables in form data, JSON body, or a blank value
  def prepare_variables(variables_param)
    case variables_param
    when String
      if variables_param.present?
        JSON.parse(variables_param) || {}
      else
        {}
      end
    when Hash
      variables_param
    when ActionController::Parameters
      variables_param.to_unsafe_hash # GraphQL-Ruby will validate name and type of incoming variables.
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{variables_param}"
    end
  end

  def handle_error_in_development(e)
    logger.error e.message
    logger.error e.backtrace.join("\n")

    render json: { errors: [{ message: e.message, backtrace: e.backtrace }], data: {} }, status: 500
  end
end
