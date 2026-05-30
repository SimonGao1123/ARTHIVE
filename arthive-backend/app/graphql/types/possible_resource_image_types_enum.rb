module Types
    class PossibleResourceImageTypesEnum < Types::BaseEnum
        description "The possible types of resources that an image can be attached to"
        value "media", "Media"
        value "user", "User"
        value "review", "Review"
        value "community_thread", "Community Thread"
    end
end