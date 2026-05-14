module Mutations
    class CreateMedia < BaseMutation
        type Types::MediaType, null: false

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
        argument :cover_image, String, required: false


        def resolve(**args)
            validate_user

            media = Media.new(args)
            media.user = context[:current_user]
            
            if media.save
                # currently communities are created automatically when a media is created (one to one with media)
                # so we technically don't need communities at all, but keep in case of one to many relationship in future
            
                Community.create!(media: media)

                return media
            else
                raise GraphQL::ExecutionError, media.errors.full_messages.join(", ") unless media.errors.empty?
            end
        end
    end
end