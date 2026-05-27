class CreateNotificationsTable < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications_tables do |t|
      t.timestamps

      t.string :action, null: false

      t.string :message_id, null: false

      t.references :receiver, null: false, foreign_key: { to_table: :users, column: :id }
      t.references :sender, null: false, foreign_key: { to_table: :users, column: :id }

      t.references :review_comment, null: true, foreign_key: true
      t.references :review, null: true, foreign_key: true

      t.references :parent_thread, null: true, foreign_key: { to_table: :community_threads , column: :id}
      t.references :comment_thread, null: true, foreign_key: { to_table: :community_threads , column: :id}
      
      
    end
  end
end
