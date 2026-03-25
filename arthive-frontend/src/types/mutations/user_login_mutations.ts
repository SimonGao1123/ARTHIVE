import { gql } from "@apollo/client"
import type { User } from "../user_types"
export const LOGIN_USER = gql`
    mutation LoginUser($input: LoginInput!) {
        login(input: $input) {
            token
            user {
                id
                username
                email
                profilePicture
                ifAdmin
            }
        }
    }
`

export const CREATE_USER = gql`
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            id
            username
            email
            ifAdmin
        }
    }
`

export type LoginInput = {
    input: {
        email: string,
        password: string
    }
}


export type LoginUserMutation = {
    login: {
        token: string,
        user: User
    }
}

export type CreateUserInput = {
    input: {
        email: string,
        username: string,
        password: string
    }
}

export type CreateUserMutation = {
    createUser: {
        id: string,
        username: string,
        email: string,
        ifAdmin: boolean
    }
}

export const WHOAMI_QUERY = gql`
    query Whoami {
        whoami {
            id
            username
            email
            profilePicture
            ifAdmin
        }
    }
`