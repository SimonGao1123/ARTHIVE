module Types
    class OffsetPageInfoType < Types::BaseObject
        field :total_pages, Int, null: false
        field :total_count, Int, null: false
    end
end