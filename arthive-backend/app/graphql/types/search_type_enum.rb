module Types
    class SearchTypeEnum < Types::BaseEnum
        value "all", "Search all"
        value "media", "Search media"
        value "user", "Search users"
        value "review", "Search reviews"
        value "list", "Search lists"
        value "thread", "Search root threads"
    end
end