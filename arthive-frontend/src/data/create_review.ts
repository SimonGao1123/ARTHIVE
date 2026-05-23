
import type { UserReview } from "../types/review_type";
import { logout } from "./logout";
import type { User } from "../types/user_types";
import { uploadMultipleFilesToS3 } from "./upload_file_to_s3";
const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

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
    navigate: any
) {
    createReview({ variables: { input: { mediaId, content: reviewContent === "" ? null : reviewContent, rating: rating === 0 ? null : rating, ifFavorite, ifFinished, reviewId: userReview ? userReview.id : null } } })
    .then(async (data: any) => {
        if (data.data.createReview.deleted) {
            setUserReview(null)
        } else {
            
            const updated_review = data.data.createReview.review
            setUserReview(updated_review)

            // only upload if there is accompanying content
            if (reviewContent === "") {
                return
            }
            if (newReviewImages.length > 0) {
                const jwt = localStorage.getItem("authToken")
                if (!jwt) {
                    logout(setUser, navigate)
                    return
                }
                const signedIds = await uploadMultipleFilesToS3(newReviewImages.map((image) => image.file), jwt)
                if (!signedIds) {
                    alert("Error uploading images to S3")
                    return
                }
                const attachResults = await uploadImageToS3({variables: {signedIds, resourceId: updated_review.id, resourceType: "review"}})
                if (!attachResults.data?.attachS3Image?.success) {
                    alert("Error attaching images to review")
                    return
                }
            }
        }
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
    })
}