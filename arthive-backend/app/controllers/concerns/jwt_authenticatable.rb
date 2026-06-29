module JwtAuthenticatable
    extend ActiveSupport::Concern

    included do
        before_action :validate_user
    end

    def validate_user
        token = cookies[:authToken]
        token = nil if token.blank?
        @current_user = nil

        if token
            begin
                payload = JsonWebToken.decode(token)
                @current_user = User.find_by(id: payload['user_id'])
                if @current_user.nil?
                    render json: { error: "UNAUTHENTICATED", message: "Not authenticated" }, status: :unauthorized
                    return
                elsif !payload['token_version'].present? || @current_user.token_version.to_i != payload['token_version'].to_i
                    render json: { error: "UNAUTHENTICATED", message: "Token version mismatch" }, status: :unauthorized
                    return
                end

            rescue JWT::ExpiredSignature
                render json: { error: "UNAUTHENTICATED", message: "Token has expired" }, status: :unauthorized
                return
            rescue JWT::DecodeError
                render json: { error: "UNAUTHENTICATED", message: "Invalid token" }, status: :unauthorized
                return
            end
        else
            render json: { error: "UNAUTHENTICATED", message: "Not authenticated" }, status: :unauthorized
            return
        end

        
    end
end