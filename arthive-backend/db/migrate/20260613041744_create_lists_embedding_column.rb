class CreateListsEmbeddingColumn < ActiveRecord::Migration[8.1]
  def change
    enable_extension 'vector'
    add_column :lists, :embedding, :vector, limit: 1024
    execute "CREATE INDEX index_lists_on_embedding ON lists USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
  end
end
