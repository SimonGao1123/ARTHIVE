export default function DeleteReviewPopup({setShowDeleteReviewPopup, setIfFinished, setReviewContent, setRating}: {setShowDeleteReviewPopup: (show: boolean) => void, setIfFinished: (finished: boolean) => void, setReviewContent: (content: string) => void, setRating: (rating: number) => void}) {
    return (
        <div>
            <h1>Marking unfinished will cause review and rating to be deleted</h1>
            <button onClick={() => setShowDeleteReviewPopup(false)}>Cancel</button>
            <button onClick={() => {
                setIfFinished(false)
                setReviewContent("")
                setRating(0)
                setShowDeleteReviewPopup(false)
            }}>Delete</button>
        </div>
    )
}