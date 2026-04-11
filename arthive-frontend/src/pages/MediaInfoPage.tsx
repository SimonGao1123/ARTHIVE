import { useLazyQuery } from "@apollo/client/react"
import {
    OBTAIN_MEDIA_INFO_QUERY,
    type ObtainMediaInfoInput,
    type ObtainMediaInfoResponse,
} from "../types/queries/media_request_query"
import type { User } from "../types/user_types"
import { useNavigate, useParams } from "react-router-dom"
import type { Media } from "../types/media_type"
import { useEffect, useState } from "react"
import { ObtainMediaDetailsFetch } from "../data/obtain_media_details"
import { MediaInfoArticle } from "../lib/MediaInfoArticle"
import UserMediaReview from "../lib/UserMediaReview"
import { decodeReturnPath } from "../lib/prevPageRouting"

type MediaInfoPageProps = {
    setUser: (user: User | null) => void
    user: User | null
}

export default function MediaInfoPage({ user,setUser }: MediaInfoPageProps) {
    const { prev_page, id } = useParams()
    const navigate = useNavigate()
    const [getMediaInfo, { error, loading }] = useLazyQuery<
        ObtainMediaInfoResponse,
        ObtainMediaInfoInput
    >(OBTAIN_MEDIA_INFO_QUERY)
    const [mediaInfo, setMediaInfo] = useState<Media | null>(null)

    useEffect(() => {
        const mediaId = id != null && id !== "" ? Number(id) : NaN
        if (!Number.isFinite(mediaId)) {
            navigate("/", { replace: true })
            return
        }
        try {
            ObtainMediaDetailsFetch(
                getMediaInfo,
                navigate,
                setUser,
                mediaId,
                setMediaInfo
            )
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            console.log(message)
            navigate("/", { replace: true })
        }
    }, [id])

    const showContent = Boolean(mediaInfo) && !loading

    return (
        <main>
            <button onClick={() => navigate(decodeReturnPath(prev_page))}>Back</button>
            
            <button onClick={() => navigate(`/media/${prev_page}/${id}/reviews`)}>Reviews</button>
            {loading ? (
                <p role="status" aria-live="polite">
                    Loading…
                </p>
            ) : null}

            {error ? (
                <div role="alert">
                    <p>{error.message}</p>
                </div>
            ) : null}

            {showContent && mediaInfo ? (
                <>
                    <UserMediaReview mediaId={Number(id)} setUser={setUser} mediaInfo={mediaInfo}/>
                    <MediaInfoArticle media={mediaInfo} />
                </>
            ) : null}


        </main>
    )
}
