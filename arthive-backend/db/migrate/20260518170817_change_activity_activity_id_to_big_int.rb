class ChangeActivityActivityIdToBigInt < ActiveRecord::Migration[8.1]
  def change
    change_column :activities, :activity_id, :bigint
  end
end
