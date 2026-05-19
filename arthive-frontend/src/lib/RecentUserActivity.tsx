import type { User } from "../types/user_types"
import { RECENT_USER_ACTIVITY_REQUEST } from "../types/queries/recent_user_activity_request"
import type { Activity, RecentUserActivityInput, RecentUserActivityResponse } from "../types/queries/recent_user_activity_request"
import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { obtainRecentUserActivityFunction } from "../data/obtain_recent_user_activity"
import { useNavigate } from "react-router-dom"
import DisplayRating from "./DisplayRating"
type RecentUserActivityProps = {
    user: User,
    setUser: (user: User | null) => void,
    navigate: any
}
const LIMIT = 10
export default function RecentUserActivity({ user, setUser, navigate }: RecentUserActivityProps) {
    const [recentUserActivity, setRecentUserActivity] = useState<Activity[]>([])
    
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState<boolean>(false)
    const [loadCount, setLoadCount] = useState<number>(0)

    const [obtainRecentUserActivity, {error, loading}] = useLazyQuery<RecentUserActivityResponse, RecentUserActivityInput>(RECENT_USER_ACTIVITY_REQUEST)
    console.log(user)
    useEffect(() => {
        obtainRecentUserActivityFunction(user.id, setRecentUserActivity, setUser, navigate, obtainRecentUserActivity, cursor, setCursor, LIMIT, setHasNextPage)
    }, [loadCount])

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {recentUserActivity.map((activity) => {
                return (
                    <>
                        <ActivityCard activity={activity} />
                        <hr />
                    </>
                )
            })}
            {hasNextPage && <button onClick={() => setLoadCount(loadCount + 1)}>Load More</button>}
        </div>
    )
}

function ActivityCard({ activity }: { activity: Activity }) {
    const navigate = useNavigate()
    const subject = () => {
        switch (activity.subject.__typename) {
            case "Review":
                return <ReviewCard review={activity.subject as any} navigate={navigate} />
            case "ReviewComment":
                return <ReviewCommentCard reviewComment={activity.subject as any} navigate={navigate} />
            case "ReviewLike":
                return <ReviewLikeCard reviewLike={activity.subject as any} navigate={navigate} />
            case "ThreadLike":
                return <ThreadLikeCard threadLike={activity.subject as any} navigate={navigate} />
            case "List":
                return <ListCard list={activity.subject as any} navigate={navigate} />
            case "Thread":
                return <ThreadCard thread={activity.subject as any} navigate={navigate} />
            case "MediaInList":
                return <MediaInListCard mediaInList={activity.subject as any} navigate={navigate} />
            default:
                return <p>Unknown Subject</p>
        }
    }
    return (
        <div>
            <p>STATUS: {activity.status}</p>
            <p>{activity.createdAt}</p>
            <p>SUBJECT: {activity.subject.__typename}</p>
            {subject()}
        </div>
    )
}

function ReviewCard({ review, navigate }: any) {
    return (
        <div>
            <p onClick={() => navigate(`/review_info/${review.id}`)}>{review.content}</p>
            <DisplayRating rating={review.rating || 0} />
            <p>{review.ifFavorite ? "Favorite" : "Not Favorite"}</p>
            <p>{review.ifFinished ? "Finished" : "Not Finished"}</p>
            <p>{review.media.title}</p>
            <img src={review.media.coverImage || ""} alt={review.media.title} />
        </div>
    )
}
function ReviewCommentCard({ reviewComment, navigate }: any) {
    return (
        <div>
            <p onClick={() => navigate(`/review_info/${reviewComment.review.id}`)}>{reviewComment.comment}</p>
            <p>For Review by: {reviewComment.review.user.username}</p>
        </div>
    )
}

function ReviewLikeCard({ reviewLike, navigate }: any) {
    return (
        <div>
            <p onClick={() => navigate(`/review_info/${reviewLike.review.id}`)}>Liked Review by: {reviewLike.review.user.username}</p>
        </div>
    )
}

function ThreadLikeCard({ threadLike, navigate }: any) {
    return (
        <div>
            <p onClick={() => navigate(`/thread_info/${threadLike.thread.id}`)}>Liked Thread by: {threadLike.thread.user.username}</p>
        </div>
    )
}

function ListCard({ list, navigate }: any) {
    return (
        <div>
            <p onClick={() => navigate(`/list/${list.id}`)}>{list.name}</p>
        </div>
    )
}
function ThreadCard({ thread, navigate }: any) {
    return (
        <div>
            <p onClick={() => navigate(`/community/${thread.community.media.id}/thread/${thread.id}`)}>{thread.title}</p>
            <p>By: {thread.user.username}</p>
        </div>
    )
}

function MediaInListCard({ mediaInList, navigate }: any) {
    return (
        <div>
            <p onClick={() => navigate(`/list/${mediaInList.list.id}`)}>Added to List: {mediaInList.list.name}</p>
            <p onClick={() => navigate(`/media/${mediaInList.media.id}`)}>{mediaInList.media.title}</p>
        </div>
    )
}
