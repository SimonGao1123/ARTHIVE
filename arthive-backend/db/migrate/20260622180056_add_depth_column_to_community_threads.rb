class AddDepthColumnToCommunityThreads < ActiveRecord::Migration[8.1]
  def change
    add_column :community_threads, :depth, :integer, default: 0
  end
end
