module Mutations
    class AddOrRemoveMediaInList < BaseMutation
        type Types::ListType, null: false

        argument :list_id, ID, required: true

        argument :if_add, Boolean, required: true
        argument :media_ids, [ID], required: true
        def resolve(list_id:, if_add:, media_ids:)
            validate_user

            list = List.find_by(id: list_id)
            if !list.present?
                raise GraphQL::ExecutionError, "List #{list_id} not found"
            end
            if list.user.id != context[:current_user].id
                raise GraphQL::ExecutionError, "You are not the owner of list #{list_id}"
            end

            new_content_type = Set.new(list.content_type.to_a)

            media_ids.each do |media_id|
                if !Media.exists?(id: media_id)
                    raise GraphQL::ExecutionError, "Media #{media_id} not found"
                end

                if if_add
                    media_in_list = MediaInList.new(
                        list: list,
                        media_id: media_id
                    )
                    if !media_in_list.save
                        raise GraphQL::ExecutionError, media_in_list.errors.full_messages.join(", ")
                    end
                    new_content_type << Media.find_by(id: media_id).content_type
                else
                    media_in_list = MediaInList.find_by(list_id: list_id, media_id: media_id)
                    if !media_in_list.present?
                        raise GraphQL::ExecutionError, "Media #{media_id} not in list #{list_id}"
                    end
                    if !media_in_list.destroy
                        raise GraphQL::ExecutionError, media_in_list.errors.full_messages.join(", ")
                    end
                end
            end

            if !if_add
                new_content_type = Set.new(
                    list.media_in_lists.reload.map { |mil| Media.find_by(id: mil.media_id).content_type }
                )
            end
            
            if !list.update(content_type: new_content_type.to_a)
                raise GraphQL::ExecutionError, list.errors.full_messages.join(", ")
            end

            return list
        rescue ActiveRecord::RecordNotFound => e
            raise GraphQL::ExecutionError, e.message
        end
    end
end