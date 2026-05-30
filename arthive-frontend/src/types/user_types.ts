export type User = {
    id: string,
    username: string,
    email: string,
    profilePicture: string | null,
    ifAdmin: boolean,
    description: string | null,
    visibility: string,
}

export type WhoamiResponse = {
    whoami: User
}
