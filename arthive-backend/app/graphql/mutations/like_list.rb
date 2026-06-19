module Mutations
    class LikeList < BaseMutation
        description "Like a list, returns true if like is created, false if like is destroyed"
        type Boolean, null: false

        argument :list_id, ID, required: true

        def resolve(list_id:)
            validate_user

            begin
                list = List.find_by(id: list_id)
                if list.blank?
                    raise GraphQL::ExecutionError, "List not found"
                end

                if !User.if_visible_to_user(context[:current_user].id, list.user.id)
                    raise GraphQL::ExecutionError, "You are not allowed to like this list"
                end

                if list.if_private && list.user.id != context[:current_user].id
                    raise GraphQL::ExecutionError, "You are not allowed to like this list"
                end

                liked = ListLike.toggle_like(context[:current_user].id, list_id)
                if liked
                    list_like = ListLike.find_by(user_id: context[:current_user].id, list_id: list_id)
                    Activity.log(user: context[:current_user], subject: list_like, status: "created", 
                    snapshot: {
                        list_name: list.name,
                    })
                    if list.user.id != context[:current_user].id
                        SQS_CLIENT.send_message(
                            queue_url: SQS_QUEUE_URL,
                            message_body: {
                                type: "notification",
                                action: "like_on_list",
                                sender_id: context[:current_user].id,
                                receiver_id: list.user.id,
                                list_id: list.id
                            }.to_json
                        )
                    end
                end
                liked

            rescue ActiveRecord::RecordNotFound => e
                raise GraphQL::ExecutionError, e.message
            rescue ActiveRecord::RecordInvalid => e
                raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
            end
        end
    end
end