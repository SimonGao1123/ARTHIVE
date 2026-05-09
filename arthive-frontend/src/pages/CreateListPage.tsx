import { useState } from "react"
import type { User } from "../types/user_types"
import type { CreateListInput, CreateListResponse } from "../types/mutations/create_edit_list_mutation"
import { useMutation } from "@apollo/client/react"
import { CREATE_LIST_MUTATION } from "../types/mutations/create_edit_list_mutation"
export default function CreateListPage({setUser}: {setUser: (user: User) => void}) {

    const [addedMediaIds, setAddedMediaIds] = useState<string[]>([])
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [tags, setTags] = useState<string[]>([])
    const [ifPrivate, setIfPrivate] = useState<boolean>(false)

    const [createList, {loading, error}] = useMutation<CreateListResponse, CreateListInput>(CREATE_LIST_MUTATION)
    return (
        <div>
            {error && <div>{error.message}</div>}
            {loading && <div>Loading...</div>}
            <h1>Create List</h1>
        </div>
    )
}