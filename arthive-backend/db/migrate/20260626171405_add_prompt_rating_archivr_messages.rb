class AddPromptRatingArchivrMessages < ActiveRecord::Migration[8.1]
  def change
    add_column :archivr_messages, :prompt_rating, :integer, null: true
  end
end
