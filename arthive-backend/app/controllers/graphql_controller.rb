# frozen_string_literal: true

class GraphqlController < ApplicationController
  # If accessing from outside this domain, nullify the session
  # This allows for outside API access while preventing CSRF attacks,
  # but you'll have to authenticate your user separately
  protect_from_forgery with: :null_session

  def execute
    variables = prepare_variables(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]

    # extract the token from the Authorization header
    auth_header = request.headers['Authorization']
    token = auth_header&.split(' ')&.last

    current_user = nil
    auth_error = nil

    # decode the token and set the current user if valid
    if token.present?
      begin
        payload = JsonWebToken.decode(token)
        current_user = User.find_by(id: payload['user_id'])
        auth_error = 'USER_NOT_FOUND' if current_user.blank?
      rescue JWT::ExpiredSignature
        auth_error = 'EXPIRED_TOKEN'
      rescue JWT::DecodeError
        auth_error = 'INVALID_TOKEN'
      end
    else
      auth_error = 'NO_TOKEN'
    end

    context = {
      current_user: current_user,
      request: request,
      auth_error: auth_error
    }
    
    result = ArthiveBackendSchema.execute(query, variables: variables, context: context, operation_name: operation_name)
    render json: result
  rescue StandardError => e
    raise e unless Rails.env.development?
    handle_error_in_development(e)
  end

  private

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
