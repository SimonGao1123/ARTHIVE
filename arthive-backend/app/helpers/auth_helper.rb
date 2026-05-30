module AuthHelper
    def validate_user
        
        auth = context[:auth_error]
        if auth.in?(%w[EXPIRED_TOKEN INVALID_TOKEN NO_TOKEN USER_NOT_FOUND]) || context[:current_user].blank?
            raise GraphQL::ExecutionError, auth
        end
    end
end
    