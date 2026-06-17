module GeminiClient
    GEMINI_URL = ENV['GEMINI_MODEL_URL']

    def self.call_gemini(prompt)
        uri = URI("#{GEMINI_URL}?key=#{ENV['GEMINI_API_KEY']}")
        response = Net::HTTP.post(
          uri,
          { contents: [{ parts: [{ text: prompt }] }] }.to_json,
          "Content-Type" => "application/json"
        )
        parsed = JSON.parse(response.body)
        if response.code != "200"
          Rails.logger.error "Gemini #{response.code}: #{parsed}"
          return nil
        end
        parsed.dig("candidates", 0, "content", "parts", 0, "text")
      rescue => e
        Rails.logger.error "Gemini error: #{e.message}"
        nil
    end

    # tools is just the schemas from ArchivrTools, standardized for Gemini, might need to switch
    # single round trip, so contents slowly gets built up, returns response from gemini and 
    def self.call_gemini_with_tools(system_instructions:, contents:, tools:)
        uri = URI("#{GEMINI_URL}?key=#{ENV['GEMINI_API_KEY']}")
        request_body = {
            system_instruction: {"parts"=> [{"text"=> system_instructions}]},
            contents: contents,
            tools: [{functionDeclarations: tools}]
        }

        response = Net::HTTP.post(
            uri,
            request_body.to_json,
            "Content-Type" => "application/json"
        )
        parsed = JSON.parse(response.body)
        if response.code != "200"
            Rails.logger.error "Gemini #{response.code}: #{parsed}"
            return {error: "Gemini #{response.code}: #{parsed}"}
        end
        parts = parsed.dig("candidates", 0, "content", "parts") || [] # can be pure text, single tool or a mix

        text_pieces = []
        tool_calls = []

        parts.each do |part|
            if part["text"].present?
                text_pieces << part["text"]
            elsif part["functionCall"].present?
                tool_calls << {
                    name: part["functionCall"]["name"],
                    args: part["functionCall"]["args"] || {}
                }
            end
        end

        text = text_pieces.empty? ? nil : text_pieces.join("\n")

        return {
            text: text,
            tool_calls: tool_calls,
            raw_model_turn: parsed.dig("candidates", 0, "content")
        }
    end
end