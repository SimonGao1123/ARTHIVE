class AddReadAtColumnToNotifications < ActiveRecord::Migration[8.1]
  def change
    add_column :notifications, :read_at, :datetime, null: true
  end
end
