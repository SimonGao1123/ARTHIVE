class RemoveIfRootFromCommunityThreads < ActiveRecord::Migration[8.1]
  def change
    remove_column :community_threads, :if_root, :boolean
    change_column_null :community_threads, :title, true
  end
end
