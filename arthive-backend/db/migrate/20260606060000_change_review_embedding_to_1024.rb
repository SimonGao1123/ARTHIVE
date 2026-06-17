class ChangeReviewEmbeddingTo1024 < ActiveRecord::Migration[8.1]
  def change
    execute "DROP INDEX IF EXISTS index_reviews_on_embedding"
    remove_column :reviews, :embedding
    add_column :reviews, :embedding, :vector, limit: 1024
    execute "CREATE INDEX index_reviews_on_embedding ON reviews USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
  end
end
