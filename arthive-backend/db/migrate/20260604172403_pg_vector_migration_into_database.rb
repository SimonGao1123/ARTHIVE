class PgVectorMigrationIntoDatabase < ActiveRecord::Migration[8.1]
  def change
    enable_extension "vector"
    add_column :reviews, :embedding, :vector, limit: 1536
    execute "CREATE INDEX index_reviews_on_embedding ON reviews USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
  end
end
