class RefreshToken < ApplicationRecord
    belongs_to :user

    belongs_to :replaced_by, class_name: "RefreshToken", optional: true

    scope :active, -> {
        where(revoked_at: nil).where("expires_at > ?", Time.current)
    }

    def self.lookup(raw_token)
        token_digest = Digest::SHA256.hexdigest(raw_token)
        RefreshToken.find_by(token_digest: token_digest)
    end

    def self.generate_raw
        SecureRandom.urlsafe_base64(64)
    end

    def self.digest_for(raw)
        Digest::SHA256.hexdigest(raw)
    end

    def self.cleanup_expired
        deleted = RefreshToken.where("expires_at < ? OR (revoked_at IS NOT NULL AND revoked_at < ?)", Time.current, Time.current)
        .delete_all

        Rails.logger.info "RefreshTokens cleanup: deleted #{deleted} expired tokens"
    end



end
