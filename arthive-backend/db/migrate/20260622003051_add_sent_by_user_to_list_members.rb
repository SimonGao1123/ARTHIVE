class AddSentByUserToListMembers < ActiveRecord::Migration[8.1]
  def change
    add_reference :list_members, :sent_by_user, null: true, foreign_key: { to_table: :users, column: :id }
  end
end
