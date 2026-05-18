class CreateActivities < ActiveRecord::Migration[8.1]
  def change
    create_table :activities, id: :uuid do |t|

      t.string :activity_type, null: false
      t.integer :activity_id, null: false
      t.references :user, null: false, foreign_key: true
      t.timestamps
      t.string :status, null: false

      t.index :user_id, name: "idx_activities_user_id"
    end
  end
end
