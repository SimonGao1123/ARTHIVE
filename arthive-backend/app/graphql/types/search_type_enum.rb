module Types
    class SearchTypeEnum < Types::BaseEnum
        value "all", "Search all"
        value "media", "Search media"
        value "user", "Search users"
        value "review", "Search reviews"
    end
end