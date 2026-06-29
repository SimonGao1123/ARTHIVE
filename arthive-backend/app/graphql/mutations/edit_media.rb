module Mutations
    class EditMedia < BaseMutation
        type Types::MediaType, null: true

        argument :media_id, ID, required: true
        argument :title, String, required: true
        argument :creator, String, required: true
        argument :year, String, required: true
        argument :content_type, Types::ContentTypeEnum, required: true
        argument :language, String, required: true
        argument :summary, String, required: true
        argument :genre, [String], required: true
        argument :ongoing, Boolean, required: true
        argument :actors, [String], required: false
        argument :page_count, Int, required: false
        argument :series_title, String, required: false
        argument :organization, String, required: false

        argument :if_deleted, Boolean, required: true

        def resolve(**args)
            validate_admin

            media = Media.find_by(id: args[:media_id])
            if !media.present?
                raise GraphQL::ExecutionError, "Media #{args[:media_id]} not found"
            end

            if args[:if_deleted]
                media.destroy!
                return nil
            end
            
            updates = args.except(:media_id, :if_deleted)

            if updates[:genre].present?
                updates[:genre] = updates[:genre].map(&:downcase)
                invalid = updates[:genre].select { |g| !Media::GENRES.include?(g) }
                if !invalid.blank?
                    raise GraphQL::ExecutionError, "Invalid genres: #{invalid.join(", ")}"
                end
            end

            media.update!(updates)
            return media
        end
    end
end