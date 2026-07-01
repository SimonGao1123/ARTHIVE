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
    editUserProfile: {
        id: string
        username: string
        email: string
        profilePicture: string | null
        description: string | null
        visibility: string
        ifAdmin: boolean
    }
}

// ────────────── LOGIN_USER ──────────────

export type LoginInput = {
    input: {
        email: string
        password: string
    }
}

// The mutation selection set is `{ user { id, username, email, profilePicture,
// ifAdmin, description, visibility } }` — no `token` field. Auth token lives
// in the httpOnly cookie set by the backend.
export type LoginUserMutation = {
    login: {
        user: {
            id: string
            username: string
            email: string
            profilePicture: string | null
            ifAdmin: boolean
            description: string | null
            visibility: string
        }
    }
}

// ────────────── LOGOUT ──────────────

export type LogoutMutation = {
    logout: boolean
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
