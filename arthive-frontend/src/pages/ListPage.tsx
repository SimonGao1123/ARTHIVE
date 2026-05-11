import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "../types/user_types";
import { useNavigate, useParams } from "react-router-dom";
import type { Media } from "../types/media_type";
import type { ListType, ObtainListPageInput, ObtainListPageResponse } from "../types/queries/lists_request_queries";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { OBTAIN_LIST_PAGE_QUERY } from "../types/queries/lists_request_queries";
import { obtainListDetails } from "../data/obtain_list_details";
import { NumberedPagination } from "../lib/NumberedPagination";
import type { AddOrRemoveMediaInListInput, AddOrRemoveMediaInListResponse } from "../types/mutations/create_edit_list_mutation";
import { ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION, EDIT_LIST_DETAILS_MUTATION } from "../types/mutations/create_edit_list_mutation";
import { addOrRemoveMediaData } from "../data/add_or_remove_media_data";
import type { EditListDetailsResponse, EditListDetailsInput } from "../types/mutations/create_edit_list_mutation";
import { editListDetails } from "../data/edit_list_details";
const LIMIT = 1
export default function ListPage({ setUser}: {setUser: (user: User | null) => void} ) {
    const {list_id} = useParams()
    const navigate = useNavigate()

    if (!list_id) {
        navigate("/")
    }
    const [totalPages, setTotalPages] = useState(0)
    const [mediaInLists, setMediaInLists] = useState<Media[]>([])
    const [listData, setListData] = useState<ListType | null>(null)
    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [pageNum, setPageNum] = useState(1)

    const [query, setQuery] = useState<string | null>(null)
    const [currQuery, setCurrQuery] = useState<string | null>(null)

    const [obtainListPage, {loading, error}] = useLazyQuery<ObtainListPageResponse, ObtainListPageInput>(OBTAIN_LIST_PAGE_QUERY)

    const [addOrRemoveMediaInListMutation, {loading: addOrRemoveMediaInListLoading, error: addOrRemoveMediaInListError}] = useMutation<AddOrRemoveMediaInListResponse, AddOrRemoveMediaInListInput>(ADD_OR_REMOVE_MEDIA_IN_LIST_MUTATION)

    const [removeMediaId, setRemoveMediaId] = useState<string>("")
    useEffect(() => {
        if (removeMediaId !== "") {
            addOrRemoveMediaData(addOrRemoveMediaInListMutation, list_id as string, [removeMediaId], setUser, navigate, false)
            setRemoveMediaId("")
        }
    }, [removeMediaId])

    useEffect(() => {
        obtainListDetails(list_id as string, pageNum, LIMIT, query, setUser, setTotalPages, navigate, obtainListPage, setTargetUser, setListData, setMediaInLists)
    }, [list_id, pageNum, query])


    console.log(listData)
    console.log(targetUser)
    console.log(mediaInLists)
    console.log(totalPages)

    const [ifEditListDetails, setIfEditListDetails] = useState<boolean>(false)
    return (
        <div>
            
            {error && <p>Error: {error.message}</p>}
            {loading && <p>Loading...</p>}
            {addOrRemoveMediaInListLoading && <p>Removing media from list...</p>}
            {addOrRemoveMediaInListError && <p>Error: {addOrRemoveMediaInListError.message}</p>}
            <h1>{targetUser?.username}'s List - {listData?.name}</h1>
            {ifEditListDetails ? <EditListDetails listData={listData as ListType} setListData={setListData} setUser={setUser} navigate={navigate} setIfEditListDetails={setIfEditListDetails}/> : <ListDetails listData={listData as ListType}/>}
            <button type="button" onClick={() => setIfEditListDetails(!ifEditListDetails)}>{ifEditListDetails ? "View List Details" : "Edit List Details"}</button>

            <input type="text" placeholder="Search" value={currQuery || ""} onChange={(e) => setCurrQuery(e.target.value)} />
            <button onClick={() => setQuery(currQuery || null)}>Search</button>

            {
                mediaInLists.map(
                    (media) => {
                        return <ListMediaCard key={media.id} media_data={media} setRemoveMediaId={setRemoveMediaId} setMediaInLists={setMediaInLists}/>
                    }
                )
            }
            <NumberedPagination totalPages={totalPages} pageNum={pageNum} setPageNum={setPageNum} />

        </div>
    )
}

function ListDetails({listData}: {listData: ListType | null}) {
    if (!listData) {
        return <p>Loading...</p>
    }
    return (
        <div>
            <p>{listData?.description}</p>
            <p>{listData?.contentType.join(", ")}</p>
            <p>{listData?.tags.join(", ")}</p>
            <p>{listData?.createdAt}</p>
            <p>{listData?.updatedAt}</p>
            <p>{listData?.ifPrivate ? "Private" : "Public"}</p>
            <p>==============================================================</p>
        </div>
    )
}

function ListMediaCard({media_data, setRemoveMediaId, setMediaInLists}: {media_data: Media, setRemoveMediaId: Dispatch<SetStateAction<string>>, setMediaInLists: Dispatch<SetStateAction<Media[]>>}) {
    const navigate = useNavigate()
    return (
        <div>
            <img onClick={() => navigate(`/media/${media_data.id}`)} src={media_data.coverImage || ""} alt={media_data.title} width={50} height={80} />
            <p>{media_data.title}</p>
            <button onClick={() => {
                setRemoveMediaId(media_data.id.toString())
                setMediaInLists((prev: Media[]) => prev.filter((m) => m.id !== media_data.id))
            }}>Remove from List</button>
            <p>-------------------------------------------------------------</p>
        </div>
    )
}

function EditListDetails({listData, setListData, setUser, navigate, setIfEditListDetails}: {listData: ListType, setListData: Dispatch<SetStateAction<ListType | null>>, setUser: (user: User | null) => void, navigate: any, setIfEditListDetails: Dispatch<SetStateAction<boolean>>}) {
    const [editListDetailsMutation, {loading, error}] = useMutation<EditListDetailsResponse, EditListDetailsInput>(EDIT_LIST_DETAILS_MUTATION)

    const [newName, setNewName] = useState<string | null>(listData?.name || null)
    const [newDescription, setNewDescription] = useState<string | null>(listData?.description || null)
    const [newTags, setNewTags] = useState<string | null>(listData?.tags?.join(", ") || null)
    const [newIfPrivate, setNewIfPrivate] = useState<boolean | null>(listData?.ifPrivate || null)


    return (
        <div>
            {error && <p>Error: {error.message}</p>}
            {loading && <p>Loading...</p>}
            <h2>Edit List Details</h2>
            <input type="text" placeholder="Name" value={newName || ""} onChange={(e) => setNewName(e.target.value)} />
            <input type="text" placeholder="Description" value={newDescription || ""} onChange={(e) => setNewDescription(e.target.value)} />
            <input type="text" placeholder="Tags" value={newTags || ""} onChange={(e) => setNewTags(e.target.value)} />
            <button type="button" onClick={() => setNewIfPrivate(!newIfPrivate)}>{newIfPrivate ? "Set Public" : "Set Private"}</button>
            <button onClick={() => {editListDetails(listData?.id as string, newName, newIfPrivate, newTags, newDescription, setUser, navigate, editListDetailsMutation, setListData)
                setIfEditListDetails(false)}}>Edit List Details</button>
            <button type="button" onClick={() => {
                setIfEditListDetails(false)
                setNewName(listData?.name || null)
                setNewDescription(listData?.description || null)
                setNewTags(listData?.tags?.join(", ") || null)
                setNewIfPrivate(listData?.ifPrivate || null)
            }}>Cancel</button>
        </div>
    )
}