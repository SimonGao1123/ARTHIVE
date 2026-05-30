class ChangeCommunityThreadsTitleNullAtt2 < ActiveRecord::Migration[8.1]
  def change
    change_column_null :community_threads, :title, true
  end
end
