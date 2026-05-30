class CreateCommunityThreads < ActiveRecord::Migration[8.1]
  def change
    create_table :community_threads do |t|
      t.timestamps

      t.references :community, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      # holds the parent thread of the thread, so that we can easily find the parent thread of a thread
      t.references :parent_thread, null:true, foreign_key: { to_table: :community_threads }

      # holds the root thread of the thread tree, so that we can easily find the root thread of a thread
      t.references :root_thread, null:true, foreign_key: { to_table: :community_threads }

      t.boolean :if_root, null: false, default: false
      t.string :title, null: false
      t.text :content, null: false

  
      t.index :if_root
    end
  end
end
