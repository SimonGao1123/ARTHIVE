class AddStatusToFollowsTable < ActiveRecord::Migration[8.1]
  def change
    add_column :follows, :status, :string
  end
end
