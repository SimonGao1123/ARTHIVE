class CreateMedia < ActiveRecord::Migration[8.1]
  def change
    create_table :media do |t|
      t.timestamps
      t.string :title, null: false
      t.string :creator, null: false
      t.string :year, null: false
      t.string :content_type, null: false
      t.string :language, null: false
      t.string :summary, null: false
      t.string :genre, null: false, array: true, default: []
      t.string :actors, null: true, array: true
      t.integer :page_count, null: true
      t.boolean :ongoing, null: false
      t.string :series_title, null: true
      t.string :organization, null: true

      t.references :user, null: false, foreign_key: true
    end
  end
end
