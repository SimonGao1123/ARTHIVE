import type { User } from "../types/user_types"
import { useMutation } from "@apollo/client/react"
import type { AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput } from "../types/mutations/create_edit_list_mutation"
import { ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION } from "../types/mutations/create_edit_list_mutation"
import { useState } from "react"
import { AllUserListsComponent } from "../pages/AllUserListsPage"
import { addOrRemoveMediaData } from "../data/add_or_remove_media_data"
import { useNavigate } from "react-router-dom"


export default function AddMediaToList({setUser, mediaId, user_id}: {setUser: (user: User | null) => void, mediaId: string, user_id: string}) {


    const [listsWithMedia, setListsWithMedia] = useState<string[]>([])
    
    const navigate = useNavigate()
    const [addOrRemoveMediaInListMutation, {loading, error}] = useMutation<AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput>(ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION)

    function addOrRemoveMediaFromList(listId: string, ifAdd: boolean) {
        if (listsWithMedia.includes(listId) && ifAdd) {
            return
        }
        if (!listsWithMedia.includes(listId) && !ifAdd) {
            return
        }
        addOrRemoveMediaData(addOrRemoveMediaInListMutation, listId, [mediaId], setUser, navigate, ifAdd)
        
        if (ifAdd && !listsWithMedia.includes(listId)) {
            setListsWithMedia([...listsWithMedia, listId])
        }
        if (!ifAdd && listsWithMedia.includes(listId)) {
            setListsWithMedia(listsWithMedia.filter((id) => id !== listId))
        }
    }
    
    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                    {error.message}
                </div>
            )}
            {loading && (
                <div className="text-gray-400 text-sm">Adding…</div>
            )}
            <AllUserListsComponent
                setUser={setUser}
                user_id={user_id}
                if_adding_media={true}
                addOrRemoveMediaFromList={addOrRemoveMediaFromList}
                listsWithMedia={listsWithMedia}
                excludeMediaId={mediaId}
            />
        </div>
    )
}
