class CreateLists < ActiveRecord::Migration[8.1]
  def change
    create_table :lists do |t|
      t.timestamps
      t.string :name, null: false
      t.string :description, null: true
      t.string :content_type, null: false, array: true, default: []
      t.boolean :if_private, null: false, default: false
      t.string :tags, null: false, array: true, default: []
      t.references :user, null: false, foreign_key: true
    end
  end
end
