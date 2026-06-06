class EmbeddingService
    # for embedding reviews into vectors pgvector column embedding
    MODEL_ID = "amazon.titan-embed-text-v2:0" # 1024 dimensions 

    def self.embed(text)
        response = ::BEDROCK_CLIENT.invoke_model(
            model_id: MODEL_ID,
            content_type: "application/json",
            accept: "application/json",
            body: {
                inputText: text
            }.to_json
        )
        JSON.parse(response.body.string)["embedding"]
    rescue Aws::BedrockRuntime::Errors::ServiceError => e
        Rails.logger.error "Error embedding text: #{e.message}"
        nil
    end
end