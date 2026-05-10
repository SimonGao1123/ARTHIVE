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
        username: string | null
        description: string | null
        profilePicture: string | null
        visibility: string | null
        email: string | null
        password: string | null
    }
}

export type EditUserProfileResponse = {
    editUserProfile: User
}