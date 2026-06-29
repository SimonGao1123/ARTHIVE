import { gql, type TypedDocumentNode } from "@apollo/client"
import type {
    EditUserProfileInput, EditUserProfileResponse,
    LoginInput, LoginUserMutation,
    CreateUserInput, CreateUserMutation,
    LogoutMutation,
} from "@/types/mutations/user_mutations_types"

export const REFRESH_SESSION_MUTATION: TypedDocumentNode<{refreshSession: boolean}> = gql`
    mutation RefreshSession {
        refreshSession(input: {})
    }
`
export const LOGOUT_MUTATION: TypedDocumentNode<LogoutMutation> = gql`
    mutation Logout {
        logout(input: {})
    }
`
export const EDIT_USER_PROFILE_MUTATION: TypedDocumentNode<EditUserProfileResponse, EditUserProfileInput> = gql`
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

export const LOGIN_USER: TypedDocumentNode<LoginUserMutation, LoginInput> = gql`
    mutation LoginUser($input: LoginInput!) {
        login(input: $input) {
            user {
                id
                username
                email
                profilePicture
                ifAdmin
                description
                visibility
            }
        }
    }
`

export const CREATE_USER: TypedDocumentNode<CreateUserMutation, CreateUserInput> = gql`
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            id
            username
            email
            ifAdmin
        }
    }
`