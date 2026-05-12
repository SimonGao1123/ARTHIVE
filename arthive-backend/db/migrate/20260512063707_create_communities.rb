class CreateCommunities < ActiveRecord::Migration[8.1]
  def change
    create_table :communities do |t|
      t.timestamps
      t.references :media, null: false, foreign_key: true, index: { unique: true }
    end
  end
end
