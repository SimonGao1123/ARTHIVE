class AddListColumnToNotifications < ActiveRecord::Migration[8.1]
  def change
    add_reference :notifications, :list, null: true, foreign_key: true
  end
end
