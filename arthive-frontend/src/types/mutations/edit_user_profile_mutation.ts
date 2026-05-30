import { gql } from "@apollo/client"
import type { User } from "../user_types"

export const EDIT_USER_PROFILE_MUTATION = gql`
    mutation EditUserProfile($input: EditUserProfileInput!) {
        editUserProfile(input: $input) {
            id
            username
            email
            profilePicture
            description
            visibility
            ifAdmin
            
        }
    }
`

export type EditUserProfileInput = {
    input: {
        username: string
        description: string | null
        visibility: string
        email: string
        password: string | null
    }
}

export type EditUserProfileResponse = {
    editUserProfile: User
}