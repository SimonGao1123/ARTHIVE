import { useNavigate, useParams } from "react-router-dom"
import type { User } from "../types/user_types"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import type { MainReview, ReviewComment } from "../types/review_type"
import { OBTAIN_REVIEW_PAGE_QUERY, type ObtainReviewPageResponse, type ObtainReviewPageInput } from "../types/queries/review_request_queries"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { obtainReviewPageFunction } from "../data/obtain_review_page"
import DisplayRating from "../lib/DisplayRating"
import { LIKE_REVIEW_MUTATION, type LikeReviewInput, type LikeReviewResponse } from "../types/mutations/like_review_mutation"
import { likeReviewFunction } from "../data/like_review"
import { WRITE_COMMENT_MUTATION, type WriteCommentInput, type WriteCommentResponse } from "../types/mutations/write_comment_mutation"
import { writeReviewCommentFunction } from "../data/write_review_comment"

const LIMIT = 1;

export default function ReviewPage({setUser}: {setUser: (user: User | null) => void}) {
    const {review_id} = useParams()

    const navigate = useNavigate()
    const [mainReview, setMainReview] = useState<MainReview | null>(null)
    const [reviewComments, setReviewComments] = useState<ReviewComment[]>([])

    const [cursor, setCursor] = useState<string | null>(null)
    const [query, setQuery] = useState<string>("")
    const [currQuery, setCurrQuery] = useState<string>("")

    const [loadCount, setLoadCount] = useState(0)

    const [ifNextPage, setIfNextPage] = useState(true)
    
    const [commentCount, setCommentCount] = useState<number>(0)
    
    useEffect(() => {
        setCommentCount(mainReview?.commentCount ?? 0)
    }, [mainReview])

    useEffect(() => {
        setCursor(null)
        setReviewComments([])
        setLoadCount(prev => prev + 1)
    }, [query])

    console.log("reviewComments", reviewComments)
    const [obtainReviewPage] = useLazyQuery<ObtainReviewPageResponse, ObtainReviewPageInput>(OBTAIN_REVIEW_PAGE_QUERY)
    useEffect(() => {
        if (review_id) {
            obtainReviewPageFunction(review_id, query, cursor, setCursor, LIMIT, setUser, navigate, obtainReviewPage, setMainReview, setReviewComments, setIfNextPage)
        }
    }, [review_id, loadCount, query])

    console.log("main review", mainReview)

    return (<div>Review Page
        {mainReview && <MainReviewComponent commentCount={commentCount} mainReview={mainReview} setUser={setUser} />}
        {review_id && <CommentComponent reviewId={review_id} setReviewComments={setReviewComments} setCommentCount={setCommentCount} setUser={setUser} navigate={navigate} />}

        <p>======================================================</p>
        <input type="text" value={currQuery} onChange={(e) => setCurrQuery(e.target.value)} />
        <button disabled={query === currQuery} onClick={() => setQuery(currQuery)}>Search</button>
        {reviewComments.map((comment) => <UserReviewCommentComponent key={comment.id} comment={comment} />)}
        {ifNextPage && <button onClick={() => setLoadCount(loadCount + 1)}>Load More</button>}
    </div>)
}


function CommentComponent({reviewId, setReviewComments, setCommentCount, setUser, navigate}: {reviewId: string, setReviewComments: Dispatch<SetStateAction<ReviewComment[]>>, setCommentCount: Dispatch<SetStateAction<number>>, setUser: (user: User | null) => void, navigate: any}) {
    const [comment, setComment] = useState("")
    const [writeComment] = useMutation<WriteCommentResponse, WriteCommentInput>(WRITE_COMMENT_MUTATION)
    return (<div>
        <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button onClick={() => {
            writeReviewCommentFunction(reviewId, comment, writeComment, setUser, navigate, setReviewComments, setCommentCount)
            setComment("")
        }
        }>
            Write Comment</button>
    </div>)
}

function UserReviewCommentComponent({comment}: {comment: ReviewComment}) {
    return (<div>
        <p>{comment.comment}</p>
        <p>{comment.createdAt}</p>
        <p>{comment.user.username}</p>
        <img width={50} height={50} src={comment.user.profilePicture ?? "/default-ARTHIVE-pfp.png"} alt="Profile Picture" loading="lazy"/>
        <p>--------------------------------------------------------</p>
    </div>)
}


function MainReviewComponent({commentCount, mainReview, setUser}: {commentCount: number, mainReview: MainReview, setUser: (user: User | null) => void}) {
    const navigate = useNavigate()

    const [currLiked, setCurrLiked] = useState(mainReview.ifLiked)
    const [likeCount, setLikeCount] = useState(mainReview.likeCount)
    const [likeReview] = useMutation<LikeReviewResponse, LikeReviewInput>(LIKE_REVIEW_MUTATION)
    return (<div>
        <h1>{mainReview.media.title}</h1>
        <p>{mainReview.media.creator}</p>
        <p>{mainReview.media.year}</p>
        <p>{mainReview.media.genre.join(", ")}</p>
        <p>{mainReview.media.contentType}</p>
        <img onClick={() => navigate(`/media/${mainReview.media.id}`)} width={50} height={50} src={mainReview.media.coverImage} alt="Cover Image" loading="lazy"/>

        <p>Posted by: {mainReview.user.username}</p>
        <img width={50} height={50} src={mainReview.user.profilePicture ?? "/default-ARTHIVE-pfp.png"} alt="Profile Picture" loading="lazy"/>
        <DisplayRating rating={mainReview.rating ?? 0} />
        <p>{mainReview.content}</p>
        <p onClick={() => likeReviewFunction(setCurrLiked, likeReview, mainReview.id, setUser, navigate, setLikeCount)}>Likes: {likeCount} {currLiked ? "❤️" : "🤍"}</p>
        <p>Comments: {commentCount} 💬</p>
        <p>If finished: {mainReview.ifFinished ? "Yes" : "No"}</p>
        <p>If favorite: {mainReview.ifFavorite ? "Yes" : "No"}</p>
        <p>Updated at: {mainReview.updatedAt}</p>
        <p>======================================================</p>
    </div>)
}