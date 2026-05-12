class CreateThreadLikes < ActiveRecord::Migration[8.1]
  def change
    create_table :thread_likes do |t|
      t.timestamps

      t.references :community_thread, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.index [:community_thread_id, :user_id], unique: true
    end
  end
end
