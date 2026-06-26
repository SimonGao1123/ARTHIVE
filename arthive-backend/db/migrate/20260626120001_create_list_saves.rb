class CreateListSaves < ActiveRecord::Migration[8.1]
  def change
    create_table :list_saves do |t|
      t.timestamps
      t.references :list, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.index [:list_id, :user_id], unique: true
    end

    add_column :lists, :list_saves_count, :integer, default: 0, null: false
  end
end
