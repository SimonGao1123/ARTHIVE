module AuthHelper
    def validate_user
        
        auth = context[:auth_error]
        if auth.in?(%w[EXPIRED_TOKEN INVALID_TOKEN NO_TOKEN USER_NOT_FOUND]) || context[:current_user].blank?
            raise GraphQL::ExecutionError, auth
        end
    end

    def validate_admin

        validate_user
        if !context[:current_user].if_admin?
            raise GraphQL::ExecutionError, "You are not an admin"
        end
    end
end
    