module Mutations
    class ReadNotifications < BaseMutation
        description "Read notifications, returns the notification ids"
        type [ID], null: false

        argument :notification_ids, [ID], required: true

        def resolve(notification_ids:)
            validate_user

            begin
                Notification.where(id: notification_ids).update_all(read_at: Time.current)
                return notification_ids
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end