class CreateMediaEmbeddings < ActiveRecord::Migration[8.1]
  def change
    enable_extension 'vector'
    add_column :media, :embedding, :vector, limit: 1024
    execute "CREATE INDEX index_media_embeddings_on_embedding ON media USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
  end
end
