module Types
    class ExploreMediaType < Types::BaseObject
        field :media, [Types::MediaType], null: false
        field :if_next_page, Boolean, null: false
        field :if_prev_page, Boolean, null: false
        field :page_num, Integer, null: false
    end
end