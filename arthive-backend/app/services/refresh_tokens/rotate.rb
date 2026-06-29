module RefreshTokens
    class Rotate
        def self.call(raw_token)
            token = RefreshToken.lookup(raw_token)
            return { ok: false, code: "INVALID_REFRESH" } if token.nil?

            # Theft branch: this row was already rotated out, yet here it is
            # being presented again. The legitimate user got the replacement;
            # someone else is replaying the old cookie. Revoke every active
            # refresh for this user AND bump token_version so all outstanding
            # access JWTs die on next use.
            if token.revoked_at.present?
                ActiveRecord::Base.transaction do
                    RefreshToken.where(user_id: token.user_id, revoked_at: nil)
                                .update_all(revoked_at: Time.current)
                    token.user.increment!(:token_version)
                end
                return { ok: false, code: "REFRESH_REUSE" }
            end

            return { ok: false, code: "EXPIRED_REFRESH" } if token.expires_at < Time.current

            # Happy path: rotate atomically so we never end up with the old
            # token revoked and no replacement on disk (which would silently
            # log the user out).
            new_raw = RefreshToken.generate_raw
            access_jwt = nil

            ActiveRecord::Base.transaction do
                new_token = RefreshToken.create!(
                    user_id: token.user_id,
                    token_digest: RefreshToken.digest_for(new_raw),
                    expires_at: 30.days.from_now,
                )
                token.update!(revoked_at: Time.current, replaced_by_id: new_token.id)
                user = token.user.reload
                access_jwt = JsonWebToken.encode({
                    user_id: user.id,
                    token_version: user.token_version,
                })
            end

            { ok: true, raw_token: new_raw, access_jwt: access_jwt }
        end
    end
end
