class CreateReviewLikes < ActiveRecord::Migration[8.1]
  def change
    create_table :review_likes do |t|
      t.timestamps

      t.references :review, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      # a user can only like a review ONCE
      t.index [:review_id, :user_id], unique: true
    end
  end
end
