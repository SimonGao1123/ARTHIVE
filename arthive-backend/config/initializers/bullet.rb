return unless defined?(Bullet)

Rails.application.config.after_initialize do
  Bullet.enable        = Rails.env.development?
  Bullet.alert         = false
  Bullet.bullet_logger = true
  Bullet.console       = true
  Bullet.rails_logger  = true
  Bullet.add_footer    = true

  # GraphQL false-alarms: associations are preloaded by resolvers for the
  # common query shape, but optional in the GraphQL field set. Bullet can't
  # see the client's runtime selection, so it flags them as unused.
  Bullet.add_safelist type: :unused_eager_loading, class_name: "CommunityThread", association: :thread_likes
  Bullet.add_safelist type: :unused_eager_loading, class_name: "CommunityThread", association: :child_threads
  Bullet.add_safelist type: :unused_eager_loading, class_name: "List",            association: :list_likes
  Bullet.add_safelist type: :unused_eager_loading, class_name: "List",            association: :list_members
  Bullet.add_safelist type: :unused_eager_loading, class_name: "Review",          association: :review_likes
  Bullet.add_safelist type: :unused_eager_loading, class_name: "Review",          association: :review_comments
end
