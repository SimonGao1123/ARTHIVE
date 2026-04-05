class CreateReviewComments < ActiveRecord::Migration[8.1]
  def change
    create_table :review_comments do |t|
      t.timestamps

      t.references :review, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :comment, null: false

      
      
    end
  end
end
