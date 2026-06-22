class AddListMemberColumnToNotifications < ActiveRecord::Migration[8.1]
  def change
    add_reference :notifications, :list_member, null: true, foreign_key: true
  end
end
