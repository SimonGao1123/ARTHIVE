
import type { UserReview } from "@/types/domain/review";
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user";
import { uploadMultipleFilesToS3 } from "@/data/media/uploadFileToS3";

export function createReviewFunction(
    uploadImageToS3: any,
    newReviewImages: {file: File, url: string, uuid: string}[],
    reviewContent: string,
    rating: number,
    ifFavorite: boolean,
    ifFinished: boolean,
    userReview: UserReview | null,
    setUserReview: (userReview: UserReview | null) => void,
    mediaId: number,
    createReview: any,
    setUser: (user: User | null) => void,
    navigate: any,
    onReviewChanged?: (review: UserReview | null) => void
) {
    createReview({ variables: { input: { mediaId, content: reviewContent === "" ? null : reviewContent, rating: rating === 0 ? null : rating, ifFavorite, ifFinished, reviewId: userReview ? userReview.id : null } } })
    .then(async (data: any) => {
        if (data.data.createReview.deleted) {
            setUserReview(null)
            onReviewChanged?.(null)
        } else {

            const updated_review = data.data.createReview.review
            setUserReview(updated_review)
            onReviewChanged?.(updated_review)

            if (reviewContent === "" || !updated_review.content) {
                return
            }
            if (newReviewImages.length > 0) {
                const signedIds = await uploadMultipleFilesToS3(newReviewImages.map((image) => image.file))
                if (!signedIds) {
                    alert("Error uploading images to S3")
                    return
                }
                const attachResults = await uploadImageToS3({variables: {signedIds, resourceId: updated_review.id, resourceType: "review"}})
                if (!attachResults.data?.attachS3Image?.success) {
                    alert("Error attaching images to review")
                    return
                }
                navigate(0)
            }
        }
    })
    .catch((error: any) => {
        handleMutationUnauth(error, setUser, navigate) 
    })
}