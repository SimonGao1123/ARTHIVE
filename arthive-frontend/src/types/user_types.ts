export type User = {
    id: string,
    username: string,
    email: string,
    profilePicture: string | null,
    ifAdmin: boolean,
    description: string | null,
    visibility: string,
    notificationsCount: number,
}

export type WhoamiResponse = {
    whoami: User
}
