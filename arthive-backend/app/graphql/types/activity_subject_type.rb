module Types
    class ActivitySubjectType < Types::BaseUnion
        possible_types Types::ReviewType, Types::ReviewCommentType, Types::ReviewLikeType,
                       Types::CommunityThreadType, Types::ThreadLikeType, Types::ListType,
                       Types::MediaInListType, Types::ListLikeType

        def self.resolve_type(object, _context)
            case object
            when Review         then Types::ReviewType
            when ReviewComment  then Types::ReviewCommentType
            when ReviewLike     then Types::ReviewLikeType
            when CommunityThread then Types::CommunityThreadType
            when ThreadLike     then Types::ThreadLikeType
            when List           then Types::ListType
            when MediaInList    then Types::MediaInListType
            when ListLike       then Types::ListLikeType
            end
        end
    end
end
