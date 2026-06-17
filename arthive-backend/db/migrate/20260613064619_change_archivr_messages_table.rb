class ChangeArchivrMessagesTable < ActiveRecord::Migration[8.1]
  def change
    remove_column :archivr_messages, :query
    remove_column :archivr_messages, :response

    add_column :archivr_messages, :content, :text, null: false
    add_column :archivr_messages, :role, :string, null: false
  end
end
