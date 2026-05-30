class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.timestamps
      t.string :content, null: true
      t.float :rating, null: true
      t.boolean :if_favorite, null: false
      t.boolean :if_finished, null: false

      t.references :user, null: false, foreign_key: true
      t.references :media, null: false, foreign_key: true

      t.index [:user_id, :media_id], unique: true
      t.index :if_favorite
      t.index :if_finished
    end
  end
end
