if Rails.application.credentials.dig(:aws, :access_key_id).present?
  SQS_CLIENT = Aws::SQS::Client.new(
      region: Rails.application.credentials.dig(:aws, :region),
      access_key_id: Rails.application.credentials.dig(:aws, :access_key_id),
      secret_access_key: Rails.application.credentials.dig(:aws, :secret_access_key),
  )
  SQS_QUEUE_URL = Rails.application.credentials.dig(:aws, :sqs_url)
else
  SQS_CLIENT = nil
  SQS_QUEUE_URL = nil
end
