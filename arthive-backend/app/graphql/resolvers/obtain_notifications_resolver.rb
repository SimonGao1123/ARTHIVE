module Resolvers
    class ObtainNotificationsResolver < BaseResolver
        type Types::AllNotificationsType, null: false

        argument :filter, Types::ObtainNotificationFilterEnum, required: false, default_value: "all"

        def resolve(filter: "all")
            validate_user

            unread_notifications = Notification
                .includes(:sender, :receiver, :review, :review_comment, :parent_thread, :comment_thread, :follow, :list)
                .where(receiver_id: context[:current_user].id, read_at: nil)
                .recent
            read_notifications = Notification
                .includes(:sender, :receiver, :review, :review_comment, :parent_thread, :comment_thread, :follow, :list)
                .where(receiver_id: context[:current_user].id)
                .where.not(read_at: nil)
                .recent

            if filter != "all"
                case filter
                when "follows"
                    unread_notifications = unread_notifications.where(action: Notification::ACTIONS[:follows])
                    read_notifications = read_notifications.where(action: Notification::ACTIONS[:follows])
                when "reviews"
                    unread_notifications = unread_notifications.where(action: Notification::ACTIONS[:reviews])
                    read_notifications = read_notifications.where(action: Notification::ACTIONS[:reviews])
                when "threads"
                    unread_notifications = unread_notifications.where(action: Notification::ACTIONS[:threads])
                    read_notifications = read_notifications.where(action: Notification::ACTIONS[:threads])
                when "quote_reviews"
                    unread_notifications = unread_notifications.where(action: Notification::ACTIONS[:quote_reviews])
                    read_notifications = read_notifications.where(action: Notification::ACTIONS[:quote_reviews])
                when "lists"
                    unread_notifications = unread_notifications.where(action: Notification::ACTIONS[:lists])
                    read_notifications = read_notifications.where(action: Notification::ACTIONS[:lists])
                when "list_members"
                    unread_notifications = unread_notifications.where(action: Notification::ACTIONS[:list_members])
                    read_notifications = read_notifications.where(action: Notification::ACTIONS[:list_members])
                end

            end
            return {
                unread_notifications: unread_notifications,
                read_notifications: read_notifications,
                unread_notifications_count: unread_notifications.count,
                read_notifications_count: read_notifications.count
            }
        end
    end
end