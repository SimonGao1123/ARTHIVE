class AssignEmbeddingJob < ApplicationJob
    queue_as :default

    def perform(target_id, target_type)

        case target_type
        when "review"
            review = Review.find_by(id: target_id)
            return if review.nil? || review.content.blank? 

            embedding = EmbeddingService.embed(review.content + ". Rating: #{review.rating ? review.rating : 'N/A'}.") # embed reviews that have content, alongside their rating
            return if embedding.nil?

            review.update(embedding: embedding)
        when "media"
            media = Media.find_by(id: target_id)
            return if media.nil? 
            text = "#{media.title}. #{media.summary}. Genre: #{media.genre.join(', ')}. Creator: #{media.creator}."
            embedding = EmbeddingService.embed(text)
            return if embedding.nil?

            media.update(embedding: embedding)
        when "community_thread"
            community_thread = CommunityThread.find_by(id: target_id)
            return if community_thread.nil?
            text = "#{community_thread.title}. #{community_thread.content}."
            embedding = EmbeddingService.embed(text)
            return if embedding.nil?

            community_thread.update(embedding: embedding)
        when "list"
            list = List.find_by(id: target_id)
            return if list.nil?
            text = "#{list.name}. Tags: #{list.tags.join(', ')}. #{list.description}."
            embedding = EmbeddingService.embed(text)
            return if embedding.nil?
            list.update(embedding: embedding)
        else
            raise "Invalid target type: #{target_type}"
        end

    end
end
