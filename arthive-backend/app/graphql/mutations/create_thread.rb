module Mutations
    class CreateThread < BaseMutation
        type Types::CommunityThreadType, null: false

        argument :community_id, ID, required: true
        argument :content, String, required: true
        argument :title, String, required: false
        argument :parent_thread_id, ID, required: false
        argument :root_thread_id, ID, required: false
        argument :review_id, ID, required: false

        def resolve(community_id:, content:, title: nil, parent_thread_id: nil, root_thread_id: nil, review_id: nil)
            validate_user

            if title.present? && (parent_thread_id.present? || root_thread_id.present?)
                raise GraphQL::ExecutionError, "Title cannot be present for non-root threads"
            end

            if (!parent_thread_id.present? && root_thread_id.present?) || (!root_thread_id.present? && parent_thread_id.present?)
                raise GraphQL::ExecutionError, "Both parent thread and root thread must be present or absent"
            end

            review = nil
            if review_id.present?
                if !Review.exists?(id: review_id)
                    raise GraphQL::ExecutionError, "Review #{review_id} not found"
                end
                review = Review.find_by(id: review_id)
            end

            new_thread = CommunityThread.new(
                community_id: community_id,
                user_id: context[:current_user].id,
                content: content,
                title: title,
                parent_thread_id: parent_thread_id,
                root_thread_id: root_thread_id,
                review: review
            )
            if !new_thread.save
                raise GraphQL::ExecutionError, new_thread.errors.full_messages.join(", ")
            end

            Activity.log(user: context[:current_user], subject: new_thread, status: "created")
            new_thread
            
            
        end
    end
end
