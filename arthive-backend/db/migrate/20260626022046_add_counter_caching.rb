class AddCounterCaching < ActiveRecord::Migration[8.1]
  def change
    add_column :community_threads, :thread_likes_count, :integer, default: 0, null: false
    add_column :community_threads, :child_threads_count, :integer, default: 0, null: false

    add_column :lists, :list_likes_count, :integer, default: 0, null: false
    add_column :lists, :media_in_lists_count, :integer, default: 0, null: false

    add_column :reviews, :review_comments_count, :integer, default: 0, null: false
    add_column :reviews, :review_likes_count, :integer, default: 0, null: false

    add_column :media, :reviews_count, :integer, default: 0, null: false
  end
end
