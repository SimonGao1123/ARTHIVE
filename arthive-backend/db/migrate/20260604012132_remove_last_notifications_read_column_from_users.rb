class RemoveLastNotificationsReadColumnFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :last_notifications_check, :datetime
  end
end
