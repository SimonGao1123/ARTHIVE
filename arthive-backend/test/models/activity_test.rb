require "test_helper"

class ActivityTest < ActiveSupport::TestCase
  def make_user
    User.create!(
      username: "u_#{SecureRandom.hex(3)}",
      email: "u_#{SecureRandom.hex(3)}@example.com",
      password: "password123",
      visibility: "public",
      if_admin: false,
    )
  end

  def make_list(owner)
    List.create!(
      user_id: owner.id,
      name: "List #{SecureRandom.hex(3)}",
      if_private: false,
      content_type: ["film"],
      tags: [],
    )
  end

  def make_activity(user, list, created_at:)
    activity = Activity.create!(
      user: user,
      subject: list,
      status: "created",
      activity_snapshot: { list_name: list.name },
    )
    activity.update_column(:created_at, created_at)
    activity
  end

  test "cleanup_old_records deletes rows older than the window" do
    user = make_user
    list = make_list(user)
    old = make_activity(user, list, created_at: 2.weeks.ago)

    Activity.cleanup_old_records

    refute Activity.exists?(id: old.id), "expected old activity to be deleted"
  end

  test "cleanup_old_records keeps rows newer than the window" do
    user = make_user
    list = make_list(user)
    fresh = make_activity(user, list, created_at: 1.day.ago)

    Activity.cleanup_old_records

    assert Activity.exists?(id: fresh.id), "expected recent activity to survive"
  end
end
