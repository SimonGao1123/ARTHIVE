import { useState } from "react"
import type { User } from "../types/user_types"
import type { CreateListInput, CreateListResponse } from "../types/mutations/create_edit_list_mutation"
import { useMutation } from "@apollo/client/react"
import { CREATE_LIST_MUTATION } from "../types/mutations/create_edit_list_mutation"
import QuickSearch from "../lib/QuickSearch"
import type { MediaSearchType } from "../types/queries/search_bar_queries"
import { useNavigate } from "react-router-dom"
import { createList } from "../data/create_list"

export default function CreateListPage({setUser, user}: {setUser: (user: User) => void, user: User | null}) {

    const [addedMediaIds, setAddedMediaIds] = useState<string[]>([])
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const [currTags, setCurrTags] = useState<string>("")

    const [ifPrivate, setIfPrivate] = useState<boolean>(false)

    const [createListMutation, {loading, error}] = useMutation<CreateListResponse, CreateListInput>(CREATE_LIST_MUTATION)
    const navigate = useNavigate()
    return (
        <div>
            {error && <div>{error.message}</div>}
            {loading && <div>Loading...</div>}
            <h1>Create List</h1>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            
            <button type="button" onClick={() => setIfPrivate(!ifPrivate)}>{ifPrivate ? "Set Public" : "Set Private"}</button>
            
            <input type="text" placeholder="Enter Tags Seperated by Comma" value={currTags} onChange={(e) => setCurrTags(e.target.value)} />


            <MediaQuickSearch setAddedMediaIds={setAddedMediaIds} setUser={setUser} addedMediaIds={addedMediaIds} />

            <button onClick={() => {
                createList(name, description, currTags, addedMediaIds, ifPrivate, setUser, navigate, createListMutation)
                navigate(`/${user?.id ?? ""}/all_lists`)
            }}>Create List</button>
        </div>
    )
}

type MediaQuickSearchProps = {
 
    setAddedMediaIds: (mediaIds: string[]) => void
    setUser: (user: User) => void
    addedMediaIds: string[]
}

const LIMIT = 2
// all we really need is to obtain the selected media ids
function MediaQuickSearch({setAddedMediaIds, setUser, addedMediaIds}: MediaQuickSearchProps) {
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [hasNextPage, setHasNextPage] = useState<boolean>(false)
    const [loadMore, setLoadMore] = useState<number>(10)
    return (
        <div>
            <h2>Media Quick Search</h2>
            <QuickSearch setSearchResults={setSearchResults} searchType="media" limit={LIMIT} setHasNextPage={setHasNextPage} loadMore={loadMore} setUser={setUser} setLoadMore={setLoadMore} />
            
            {searchResults.map((media: MediaSearchType) => (
                <QuickSearchMediaCard key={media.id} media={media} setAddedMediaIds={setAddedMediaIds} addedMediaIds={addedMediaIds} />
            ))}
            {hasNextPage && <button onClick={() => setLoadMore(loadMore + 1)}>Load More</button>}
        </div>
    )
}

function QuickSearchMediaCard({media, setAddedMediaIds, addedMediaIds}: {media: MediaSearchType, setAddedMediaIds: (mediaIds: string[]) => void, addedMediaIds: string[]}) {
    const ifAdded = addedMediaIds.includes(media.id)
    return (
        <div>
            <p>--------------------------------</p>
            <p>{media.title}{ifAdded && "(Added)"}</p>
            <img width={50} height={50} src={media.coverImage} alt={media.title} />
            {
            ifAdded ? 
            <button onClick={() => setAddedMediaIds(addedMediaIds.filter((id: string) => id !== media.id))}>Remove from List</button>
            :
            <button onClick={() => setAddedMediaIds([...addedMediaIds, media.id])}>Add to List</button>
            }
        </div>
    )
}