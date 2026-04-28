export type User = {
    id: string,
    username: string,
    email: string,
    profilePicture: string | null,
    ifAdmin: boolean,
}

export type WhoamiResponse = {
    whoami: User
}
