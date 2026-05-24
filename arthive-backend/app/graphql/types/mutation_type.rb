# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :login, mutation: Mutations::Login
    field :create_user, mutation: Mutations::CreateUser
    field :create_media, mutation: Mutations::CreateMedia

    # ALSO USED FOR UPDATING REVIEW
    field :create_review, mutation: Mutations::CreateReview
    field :like_review, mutation: Mutations::LikeReview
    field :comment_on_review, mutation: Mutations::CommentOnReview

    field :send_follow, mutation: Mutations::SendFollow
    field :manipulate_follow, mutation: Mutations::ManipulateFollow

    field :edit_user_profile, mutation: Mutations::EditUserProfile

    field :create_list, mutation: Mutations::CreateList
    field :add_or_remove_media_in_list, mutation: Mutations::AddOrRemoveMediaInList
    field :edit_list_details, mutation: Mutations::EditListDetails

    field :create_thread, mutation: Mutations::CreateThread
    field :like_thread, mutation: Mutations::LikeThread
    field :obtain_thread, resolver: Resolvers::ObtainThreadResolver

    field :attach_s3_image, mutation: Mutations::AttachS3Image
    field :remove_attached_image, mutation: Mutations::RemoveAttachedImage

    field :edit_thread, mutation: Mutations::EditThread
  end
end
