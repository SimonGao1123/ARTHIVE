if Rails.application.credentials.dig(:aws, :access_key_id).present?
  BEDROCK_CLIENT = Aws::BedrockRuntime::Client.new(
    region: Rails.application.credentials.dig(:aws, :region),
    access_key_id: Rails.application.credentials.dig(:aws, :access_key_id),
    secret_access_key: Rails.application.credentials.dig(:aws, :secret_access_key)
  )
else
  BEDROCK_CLIENT = nil
end
