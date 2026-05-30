class ChangeNotificationsTableToNotifications < ActiveRecord::Migration[8.1]
  def change
    rename_table :notifications_tables, :notifications
  end
end
