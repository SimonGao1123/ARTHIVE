class AddReferencesColumnToArchivrMessages < ActiveRecord::Migration[8.1]
  def change
    add_column :archivr_messages, :references, :jsonb, default: {}
  end
end
