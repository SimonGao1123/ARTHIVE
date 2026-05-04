module Types
    class SearchFilterInput < Types::BaseInputObject
        argument :filter, Types::SearchFilterEnum, required: true
        argument :values, [String], required: true
    end
end