class AddFollowReferenceToNotifications < ActiveRecord::Migration[8.1]
  def change
    add_reference :notifications, :follow, null: true, foreign_key: true
  end
end
