class AddAiSummaryToMedia < ActiveRecord::Migration[8.1]
  def change
    add_column :media, :reviews_ai_summary, :text, null: true
    add_column :media, :last_ai_summary_review_count, :integer, default: 0
  end
end
