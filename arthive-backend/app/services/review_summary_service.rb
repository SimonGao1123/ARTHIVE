module ReviewSummaryService
  GEMINI_URL = ENV['GEMINI_MODEL_URL']

  def self.summarize_reviews(media:)
    # Update # of reviews pulled 
    reviews = Review.where(media_id: media.id)
      .where.not(content: [nil, ""])
      .order(created_at: :desc)
      .limit(15)

    return nil if reviews.empty?

    context = reviews.map.with_index(1) do |review, i|
      "Review #{i} (#{review.rating ? "#{review.rating}/5" : "no rating"}): #{review.content}"
    end.join("\n\n")

    prompt = "Summarize what users think about #{media.title} based on the following reviews. Be concise.\n\nReviews:\n#{context}"
    return call_gemini(prompt)

  end

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
end
