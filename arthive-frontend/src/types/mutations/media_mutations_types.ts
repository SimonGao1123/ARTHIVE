export type AddOrRemoveMediaInListInput = {
    listId: string
    ifAdd: boolean
    mediaIds: string[]
}

export type AddOrRemoveMediaInListResponse = {
    addOrRemoveMediaInList: {
        id: string
        name: string
        description: string | null
        contentType: string[]
        ifPrivate: boolean
        tags: string[] | null
    }
}

export type UploadMediaInput = {
    title: string
    creator: string
    year: string
    contentType: string
    language: string
    summary: string
    genre: string[]
    ongoing: boolean
    actors?: string[]
    pageCount?: number
    seriesTitle?: string
    organization?: string
}

export type UploadMediaResponse = {
    createMedia: {
        id: string
        title: string
    }
}
