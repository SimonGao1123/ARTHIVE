module Types
    class PageInfoType < Types::BaseObject
        field :total_pages, Int, null: false
        field :total_count, Int, null: false
    end
end