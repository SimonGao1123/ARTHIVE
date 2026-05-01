module JwtAuthenticatable
    extend ActiveSupport::Concern

    included do
        before_action :validate_user
    end

    def validate_user
        auth_header = request.headers['Authorization']
        token = auth_header&.split(" ")&.last

        token = nil if token.blank?
        @current_user = nil

        if token
            begin
                payload = JsonWebToken.decode(token)
                @current_user = User.find_by(id: payload['user_id'])
            rescue JWT::ExpiredSignature
                render json: { error: "UNAUTHENTICATED", message: "Token has expired" }, status: :unauthorized
                return
            rescue JWT::DecodeError
                render json: { error: "UNAUTHENTICATED", message: "Invalid token" }, status: :unauthorized
                return
            end
        end

        if @current_user.nil?
            render json: { error: "UNAUTHENTICATED", message: "Not authenticated" }, status: :unauthorized
            return
        end
    end
end