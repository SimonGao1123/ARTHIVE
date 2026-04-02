module SharedScopeMethods
    extend ActiveSupport::Concern

    included do
        scope :recent, -> { order(created_at: :desc) }
        scope :page, -> (page_num, limit) {offset((page_num-1)*limit).limit(limit)}
    end

end
