class CreateArchivrConversationsTable < ActiveRecord::Migration[8.1]
  def change
    create_table :archivr_conversations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :media, null: false, foreign_key: true
      t.timestamps
    end
  end
end
