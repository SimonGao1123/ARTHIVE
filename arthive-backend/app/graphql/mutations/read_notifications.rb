module Mutations
    class ReadNotifications < BaseMutation
        type Types::NotificationType.connection_type, null: false

        def resolve
            validate_user

            begin
                last_check = context[:current_user].last_notifications_check
                notifications = Notification.where(
                    receiver_id: context[:current_user].id)
                    .where("created_at > ?", last_check)
                    .order(created_at: :desc)
                context[:current_user].update(last_notifications_check: Time.now)
                return notifications
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end