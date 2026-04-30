class CreateMediaInLists < ActiveRecord::Migration[8.1]
  def change
    create_table :media_in_lists do |t|
      t.timestamps
      t.references :list, null: false, foreign_key: true
      t.references :media, null: false, foreign_key: true

      t.index [:list_id, :media_id], unique: true
    end
  end
end
