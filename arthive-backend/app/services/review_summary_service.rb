module ReviewSummaryService
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
    return GeminiClient.call_gemini(prompt)

  end
end
