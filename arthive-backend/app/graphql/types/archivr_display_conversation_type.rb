module Types
    class ArchivrDisplayConversationType < Types::BaseObject
        field :messages, Types::ArchivrMessageType.connection_type, null: false
        field :recommended_prompts, [String], null: false

    end
end