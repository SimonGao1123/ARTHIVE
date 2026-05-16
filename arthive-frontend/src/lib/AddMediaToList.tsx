import type { User } from "../types/user_types"
import { useMutation } from "@apollo/client/react"
import type { AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput } from "../types/mutations/create_edit_list_mutation"
import { ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION } from "../types/mutations/create_edit_list_mutation"
import { useState, useEffect } from "react"
import { AllUserListsComponent } from "../pages/AllUserListsPage"
import { addOrRemoveMediaData } from "../data/add_or_remove_media_data"
import { useNavigate } from "react-router-dom"


export default function AddMediaToList({setUser, mediaId, user_id}: {setUser: (user: User | null) => void, mediaId: string, user_id: string}) {
    
    const [listId, setListId] = useState<string>("")
    const navigate = useNavigate()
    const [addOrRemoveMediaInListMutation, {loading, error}] = useMutation<AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput>(ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION)

    useEffect(() => {
        if (listId !== "") {
            addOrRemoveMediaData(addOrRemoveMediaInListMutation, listId, [mediaId], setUser, navigate, true)
        }
    }, [listId])
    return (
        <div>
            {error && <div>{error.message}</div>}
            {loading && <div>Loading...</div>}
            <p>Add Media to List</p>
            <AllUserListsComponent setUser={setUser} user_id={user_id} if_adding_media={true} setListId={setListId} excludeMediaId={mediaId} />
        </div>
    )
}