module Sources
  # Batches "can viewer V see user X's content?" decisions for a fixed viewer.
  # Two SQL statements per fan-out (User visibility scope + Follow accepted scope),
  # regardless of how many users are checked in the same Dataloader tick.
  #
  # Visibility rules (must match User.if_visible_to_user):
  #   1. self → always visible
  #   2. target.visibility == "public" → visible
  #   3. an accepted Follow from viewer → target → visible
  #
  # Anonymous viewers (viewer_id == nil) collapse to rule 2 only.
  class UserVisibility < GraphQL::Dataloader::Source
    def initialize(viewer_id)
      @viewer_id = viewer_id&.to_i
    end

    def fetch(target_user_ids)
      target_ids = target_user_ids.map(&:to_i)

      visibilities = User.where(id: target_ids).pluck(:id, :visibility).to_h
      public_ids = visibilities.select { |_id, vis| vis == "public" }.keys.to_set

      accepted_receivers =
        if @viewer_id
          Follow.where(sender_id: @viewer_id, receiver_id: target_ids, status: "accepted")
                .pluck(:receiver_id).to_set
        else
          Set.new
        end

      target_ids.map do |id|
        id == @viewer_id || public_ids.include?(id) || accepted_receivers.include?(id)
      end
    end
  end
end
