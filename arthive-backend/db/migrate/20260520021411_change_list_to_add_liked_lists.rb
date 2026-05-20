class ChangeListToAddLikedLists < ActiveRecord::Migration[8.1]
  def change
    add_column :lists, :likes_list, :boolean, default: false
  end
end
