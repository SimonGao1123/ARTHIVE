module Types
    class SearchFilterEnum < Types::BaseEnum
        # TODO: ADD MORE FILTERS
        value "content_type", "Search by content type"
        value "genre", "Search by genre"
    end
end