class CreateThreadsEmbeddingsColumn < ActiveRecord::Migration[8.1]
  def change
    enable_extension 'vector'
    add_column :community_threads, :embedding, :vector, limit: 1024
    execute "CREATE INDEX index_community_threads_on_embedding ON community_threads USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
  end
end
