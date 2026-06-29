module Mutations
    class RefreshSession < BaseMutation
        description "Refresh the current user's session when the access token is expired/gone"

        type Boolean, null: false

        def resolve
            # context[:request].cookies is Rack's raw Hash — STRING keys only.
            # (The ActionDispatch jar accepts symbols; this doesn't.)
            ref_token = context[:request].cookies["refreshToken"]
            if ref_token.blank?
                context[:clear_auth_cookie] = true
                raise GraphQL::ExecutionError, "INVALID_REFRESH"
            end

            result = RefreshTokens::Rotate.call(ref_token)
            if !result[:ok]
                context[:clear_auth_cookie] = true
                context[:clear_refresh_cookie] = true
                raise GraphQL::ExecutionError, result[:code]
            end

            context[:set_auth_cookie] = result[:access_jwt]
            context[:set_refresh_cookie] = result[:raw_token]
            return true
        end
    end
end