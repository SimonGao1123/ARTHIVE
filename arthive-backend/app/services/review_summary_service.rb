module ReviewSummaryService
  GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

  def self.summarize_reviews(media_id:)
    media = Media.find_by(id: media_id)
    return nil unless media


    # Update # of reviews pulled 
    reviews = Review.where(media_id: media_id)
      .where.not(content: [nil, ""])
      .order(created_at: :desc)
      .limit(15)

    return nil if reviews.empty?

    context = reviews.map.with_index(1) do |review, i|
      "Review #{i} (#{review.rating ? "#{review.rating}/5" : "no rating"}): #{review.content}"
    end.join("\n\n")

    prompt = "Summarize what users think about #{media.title} based on the following reviews. Be concise.\n\nReviews:\n#{context}"
    call_gemini(prompt)
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
