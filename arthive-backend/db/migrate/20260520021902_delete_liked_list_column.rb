class DeleteLikedListColumn < ActiveRecord::Migration[8.1]
  def change
    remove_column :lists, :likes_list
  end
end
