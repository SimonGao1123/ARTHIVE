type DeleteReviewPopupProps = {
    setShowDeleteReviewPopup: (show: boolean) => void
    createReviewFunctionWrapper: (params: {newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) => void
}
export default function DeleteReviewPopup({setShowDeleteReviewPopup, createReviewFunctionWrapper}: DeleteReviewPopupProps) {
    return (
        <div>
            <h1>Marking unfinished will cause review and rating to be deleted</h1>
            <button onClick={() => setShowDeleteReviewPopup(false)}>Cancel</button>
            <button onClick={() => {
                createReviewFunctionWrapper({newIfFinished: false, newReviewContent: "", newRating: 0})
                setShowDeleteReviewPopup(false)
            }}>Delete</button>
        </div>
    )
}