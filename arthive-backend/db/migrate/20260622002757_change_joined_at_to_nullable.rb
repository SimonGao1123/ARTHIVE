class ChangeJoinedAtToNullable < ActiveRecord::Migration[8.1]
  def change
    change_column_null :list_members, :joined_at, true
  end
end
