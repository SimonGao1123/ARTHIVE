# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_30_013037) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "follows", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "receiver_id", null: false
    t.bigint "sender_id", null: false
    t.string "status"
    t.datetime "updated_at", null: false
    t.index ["receiver_id"], name: "index_follows_on_receiver_id"
    t.index ["sender_id", "receiver_id"], name: "index_follows_on_sender_id_and_receiver_id", unique: true
    t.index ["sender_id"], name: "index_follows_on_sender_id"
  end

  create_table "lists", force: :cascade do |t|
    t.string "content_type", default: [], null: false, array: true
    t.datetime "created_at", null: false
    t.string "description"
    t.boolean "if_private", default: false, null: false
    t.string "name", null: false
    t.string "tags", default: [], null: false, array: true
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_lists_on_user_id"
  end

  create_table "media", force: :cascade do |t|
    t.string "actors", array: true
    t.string "content_type", null: false
    t.datetime "created_at", null: false
    t.string "creator", null: false
    t.string "genre", default: [], null: false, array: true
    t.string "language", null: false
    t.boolean "ongoing", null: false
    t.string "organization"
    t.integer "page_count"
    t.string "series_title"
    t.string "summary", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "year", null: false
    t.index ["user_id"], name: "index_media_on_user_id"
  end

  create_table "media_in_lists", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "list_id", null: false
    t.bigint "media_id", null: false
    t.datetime "updated_at", null: false
    t.index ["list_id", "media_id"], name: "index_media_in_lists_on_list_id_and_media_id", unique: true
    t.index ["list_id"], name: "index_media_in_lists_on_list_id"
    t.index ["media_id"], name: "index_media_in_lists_on_media_id"
  end

  create_table "review_comments", force: :cascade do |t|
    t.text "comment", null: false
    t.datetime "created_at", null: false
    t.bigint "review_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["review_id"], name: "index_review_comments_on_review_id"
    t.index ["user_id"], name: "index_review_comments_on_user_id"
  end

  create_table "review_likes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "review_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["review_id", "user_id"], name: "index_review_likes_on_review_id_and_user_id", unique: true
    t.index ["review_id"], name: "index_review_likes_on_review_id"
    t.index ["user_id"], name: "index_review_likes_on_user_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.string "content"
    t.datetime "created_at", null: false
    t.boolean "if_favorite", null: false
    t.boolean "if_finished", null: false
    t.bigint "media_id", null: false
    t.float "rating"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["if_favorite"], name: "index_reviews_on_if_favorite"
    t.index ["if_finished"], name: "index_reviews_on_if_finished"
    t.index ["media_id"], name: "index_reviews_on_media_id"
    t.index ["user_id", "media_id"], name: "index_reviews_on_user_id_and_media_id", unique: true
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "description"
    t.string "email", null: false
    t.boolean "if_admin", default: false, null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.string "username", null: false
    t.string "visibility", default: "public", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "follows", "users", column: "receiver_id"
  add_foreign_key "follows", "users", column: "sender_id"
  add_foreign_key "lists", "users"
  add_foreign_key "media", "users"
  add_foreign_key "media_in_lists", "lists"
  add_foreign_key "media_in_lists", "media", column: "media_id"
  add_foreign_key "review_comments", "reviews"
  add_foreign_key "review_comments", "users"
  add_foreign_key "review_likes", "reviews"
  add_foreign_key "review_likes", "users"
  add_foreign_key "reviews", "media", column: "media_id"
  add_foreign_key "reviews", "users"
end
