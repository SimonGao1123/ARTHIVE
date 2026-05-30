class AddLastNotificationsCheckForUserTable < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :last_notifications_check, :datetime, null: false, default: Time.now
  end
end
