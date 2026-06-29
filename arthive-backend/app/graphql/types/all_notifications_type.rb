module Types
    class AllNotificationsType < Types::BaseObject
        field :unread_notifications, Types::NotificationType.connection_type, null: false
        field :read_notifications, Types::NotificationType.connection_type, null: false
        field :unread_notifications_count, Integer, null: false
        field :read_notifications_count, Integer, null: false
    end
end