class CreateFollows < ActiveRecord::Migration[8.1]
  def change
    create_table :follows do |t|
      t.timestamps

      t.references :sender, null: false, foreign_key: { to_table: :users, column: :id }
      t.references :receiver, null: false, foreign_key: { to_table: :users, column: :id }

      t.index [:sender_id, :receiver_id], unique: true
    end

  end
end
