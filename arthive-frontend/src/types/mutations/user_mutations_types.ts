import type { User } from "@/types/domain/user"

// ────────────── EDIT_USER_PROFILE_MUTATION ──────────────

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

// ────────────── LOGIN_USER ──────────────

export type LoginInput = {
    input: {
        email: string
        password: string
    }
}

export type LoginUserMutation = {
    login: {
        token: string
        user: User
    }
}

// ────────────── CREATE_USER ──────────────

export type CreateUserInput = {
    input: {
        email: string
        username: string
        password: string
    }
}

export type CreateUserMutation = {
    createUser: {
        id: string
        username: string
        email: string
        ifAdmin: boolean
    }
}
