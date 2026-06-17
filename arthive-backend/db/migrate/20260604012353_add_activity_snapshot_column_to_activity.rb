class AddActivitySnapshotColumnToActivity < ActiveRecord::Migration[8.1]
  def change
    add_column :activities, :activity_snapshot, :jsonb, null: true
  end
end
