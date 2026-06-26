module Mutations
    class SaveList < BaseMutation
        description "Save a list, returns true if save is created, false if save is destroyed, NO NOTIFICATIONS ARE SENT"
        type Boolean, null: false

        argument :list_id, ID, required: true

        def resolve(list_id:)
            validate_user

            begin

                list = List.find_by(id: list_id)
                if list.blank?
                    raise GraphQL::ExecutionError, "List not found"
                end

                if !List.if_visible_to_user(context[:current_user].id, list)
                    raise GraphQL::ExecutionError, "You are not allowed to save this list"
                end

                saved = ListSave.toggle_save(context[:current_user].id, list_id.to_i)
                if saved
                    list_save = ListSave.find_by(user_id: context[:current_user].id, list_id: list_id.to_i)
                    Activity.log(user: context[:current_user], subject: list_save, status: "created", snapshot: {
                        list_name: list.name,
                    })
                    if list.user.id != context[:current_user].id
                        SQS_CLIENT.send_message(
                            queue_url: SQS_QUEUE_URL,
                            message_body: {
                                type: "notification",
                                action: "save_on_list",
                                sender_id: context[:current_user].id,
                                receiver_id: list.user.id,
                                list_id: list.id
                            }.to_json
                        )
                    end
                end
                saved

            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end