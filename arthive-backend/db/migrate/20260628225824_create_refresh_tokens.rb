class CreateRefreshTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :refresh_tokens do |t|
          t.timestamps
          t.string :token_digest, null: false
          t.references :user, null: false, foreign_key: true
          t.datetime :expires_at, null: false
          t.datetime :revoked_at, null: true
          t.references :replaced_by, null: true, foreign_key: { to_table: :refresh_tokens, column: :id }
    
          
    
          
          t.index :token_digest, unique: true      
    end
  end
end
