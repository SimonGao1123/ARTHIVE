class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.timestamps
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :username, null: false

      t.string :description, null: true
      t.boolean :if_admin, null: false, default: false

      t.index :email, unique: true
      t.index :username, unique: true
    end
  end
end
