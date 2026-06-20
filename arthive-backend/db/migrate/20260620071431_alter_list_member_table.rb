class AlterListMemberTable < ActiveRecord::Migration[8.1]
  def change
    add_column :list_members, :status, :string, default: "pending", null: false
    add_column :list_members, :role, :string, default: "member", null: false
    add_column :list_members, :joined_at, :datetime, null: false
    
  end
end
