class AddReviewReferenceColumnToCommunityThreads < ActiveRecord::Migration[8.1]
  def change
    add_reference :community_threads, :review, null: true, foreign_key: true
  end
end
