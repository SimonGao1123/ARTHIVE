class CreateListLikes < ActiveRecord::Migration[8.1]
  def change
    create_table :list_likes do |t|
      t.timestamps
      t.references :list, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
    end
  end
end
