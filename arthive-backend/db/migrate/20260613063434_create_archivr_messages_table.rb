class CreateArchivrMessagesTable < ActiveRecord::Migration[8.1]
  def change
    create_table :archivr_messages do |t|
      t.references :archivr_conversation, null: false, foreign_key: true
      t.string :query, null: false
      t.string :response, null: false

      t.timestamps
    end
  end
end
