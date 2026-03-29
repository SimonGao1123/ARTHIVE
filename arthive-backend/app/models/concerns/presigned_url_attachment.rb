module PresignedUrlAttachment
    
    DEFAULT_EXPIRATION = 1.hour

    module_function

    def presigned_url(attachment, expiration = DEFAULT_EXPIRATION)
        return nil unless attachment.attached?

        attachment.blob.url(expires_in: expiration)
    end
end