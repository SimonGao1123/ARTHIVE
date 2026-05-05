module Mutations
    class CreateList < BaseMutation
        type Types::ListType, null: false

        argument :name, String, required: true
        argument :if_private, Boolean, required: true
        argument :tags, [String], required: true
        argument :description, String, required: false
        argument :added_media_ids, [ID], required: false

        def resolve(name:, if_private:, tags:, description: nil, added_media_ids: nil)
            validate_user

            list = List.new(
                name: name,
                if_private: if_private,
                tags: tags.uniq,
                description: description,
                user: context[:current_user]
            )

            if !list.save
                raise GraphQL::ExecutionError, list.errors.full_messages.join(", ")
            end
            
            content_type = Set.new
            if added_media_ids.present?
                added_media_ids.each do |media_id|
                    if !Media.exists?(id: media_id)
                        raise GraphQL::ExecutionError, "Media #{media_id} not found"
                    end

                    media_in_list = MediaInList.new(
                        list: list,
                        media_id: media_id
                    )
                    if !media_in_list.save
                        raise GraphQL::ExecutionError, media_in_list.errors.full_messages.join(", ")
                    end

                    content_type << Media.find_by(id: media_id).content_type
                end
            end

            list.update!(content_type: content_type.to_a)

            return list
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end