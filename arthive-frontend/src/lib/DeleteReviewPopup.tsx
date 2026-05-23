type DeleteReviewPopupProps = {
    setShowDeleteReviewPopup: (show: boolean) => void
    createReviewFunctionWrapper: (params: {newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) => void
}

export default function DeleteReviewPopup({setShowDeleteReviewPopup, createReviewFunctionWrapper}: DeleteReviewPopupProps) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 arthive-fade-in"
            onClick={() => setShowDeleteReviewPopup(false)}
        >
            <div
                className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 id="delete-review-title" className="text-lg font-semibold text-white mb-2">
                    Discard review and rating?
                </h1>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    Marking this unwatched will delete your existing rating and review. This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setShowDeleteReviewPopup(false)}
                        className="px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            createReviewFunctionWrapper({newIfFinished: false, newReviewContent: "", newRating: 0})
                            setShowDeleteReviewPopup(false)
                        }}
                        className="px-4 py-2 rounded-full text-sm bg-red-500/90 hover:bg-red-500 text-white transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
