module Mutations
    class Logout < BaseMutation
        type Boolean, null: false

        def resolve
            validate_user

            # update token version so all sessions are invalidated
            context[:current_user].increment!(:token_version)

            RefreshToken.where(user_id: context[:current_user].id, revoked_at: nil)
            .update_all(revoked_at: Time.current) # revoke all currently available refresh tokens

            context[:clear_refresh_cookie] = true

            # defer cookie clear to the controller — it owns the response
            context[:clear_auth_cookie] = true

            return true
        end
    end
end