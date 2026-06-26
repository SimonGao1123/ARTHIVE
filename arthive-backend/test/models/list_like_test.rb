require "test_helper"

class ListLikeTest < ActiveSupport::TestCase
  def make_user(suffix, visibility: "public")
    User.create!(
      username: "u_#{suffix}_#{SecureRandom.hex(3)}",
      email: "u_#{suffix}_#{SecureRandom.hex(3)}@example.com",
      password: "password123",
      visibility: visibility,
      if_admin: false,
    )
  end

  def make_list(owner, if_private: false)
    List.create!(
      user_id: owner.id,
      name: "List #{SecureRandom.hex(3)}",
      if_private: if_private,
      content_type: ["film"],
      tags: [],
    )
  end

  test "normalize_for_list removes a non-owner non-member's like on a private list" do
    owner = make_user("owner")
    liker = make_user("liker")
    list = make_list(owner, if_private: true)
    like = ListLike.create!(user_id: liker.id, list_id: list.id)

    list.normalize_likes_saves_for_list

    refute ListLike.exists?(id: like.id), "expected non-member like to be deleted"
  end

  test "normalize_for_list keeps the owner's own like" do
    owner = make_user("owner")
    list = make_list(owner, if_private: true)
    like = ListLike.create!(user_id: owner.id, list_id: list.id)

    list.normalize_likes_saves_for_list

    assert ListLike.exists?(id: like.id), "expected owner's own like to survive"
  end

  test "normalize_for_list keeps an accepted member's like on a private list" do
    owner = make_user("owner")
    member = make_user("member")
    list = make_list(owner, if_private: true)
    ListMember.create!(list_id: list.id, user_id: member.id, status: "accepted", role: "member")
    like = ListLike.create!(user_id: member.id, list_id: list.id)

    list.normalize_likes_saves_for_list

    assert ListLike.exists?(id: like.id), "expected accepted member's like to survive"
  end

  test "normalize_for_list removes a non-follower's like when owner is private" do
    owner = make_user("owner", visibility: "private")
    non_follower = make_user("nonfollower")
    follower = make_user("follower")
    Follow.create!(sender_id: follower.id, receiver_id: owner.id, status: "accepted")

    list = make_list(owner, if_private: false)
    non_follower_like = ListLike.create!(user_id: non_follower.id, list_id: list.id)
    follower_like = ListLike.create!(user_id: follower.id, list_id: list.id)

    list.normalize_likes_saves_for_list

    refute ListLike.exists?(id: non_follower_like.id), "expected non-follower like to be deleted"
    assert ListLike.exists?(id: follower_like.id), "expected follower like to survive"
  end

  test "normalize_for_owner walks every list owned by the user" do
    owner = make_user("owner")
    stranger = make_user("stranger")
    list_a = make_list(owner, if_private: true)
    list_b = make_list(owner, if_private: true)
    like_a = ListLike.create!(user_id: stranger.id, list_id: list_a.id)
    like_b = ListLike.create!(user_id: stranger.id, list_id: list_b.id)

    List.normalize_likes_saves_for_owner(owner.id)

    refute ListLike.exists?(id: like_a.id)
    refute ListLike.exists?(id: like_b.id)
  end
end
