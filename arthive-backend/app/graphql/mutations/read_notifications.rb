module Mutations
    class ReadNotifications < BaseMutation
        type Types::NotificationType.connection_type, null: false

        def resolve
            validate_user

            begin
                ids = Notification.where(
                    receiver_id: context[:current_user].id)
                    .where(read_at: nil)
                    .pluck(:id)
                
                Notification.where(id: ids).update_all(read_at: Time.current)
                return Notification.where(id: ids).includes(:sender, :receiver, :review, :review_comment, :parent_thread, :comment_thread, :follow).order(created_at: :desc)
            rescue StandardError => e
                raise GraphQL::ExecutionError, e.message
            end
        end
    end
end