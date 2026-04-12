class AddPrivateStatusToUserTable < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :visibility, :string, default: "public", null: false
  end
end
