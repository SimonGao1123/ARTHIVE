import { logout } from "./logout"
import type { User } from "../types/user_types"
import { uploadFileToS3 } from "./upload_file_to_s3"

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export async function EditUserProfileDataFetch(
    setUser: (user: User | null) => void,
    navigate: any,
    username: string | null,
    description: string | null,
    email: string | null,
    visibility: string | null,
    profilePicture: File | null,
    password: string | null,
    editUserProfile: any,
    uploadImageToS3: any
) {
    
    editUserProfile({variables: {input: {username, description, email, visibility, password}}})
    .then(async (data: any) => {
        if (data.data?.editUserProfile) {
            const jwt = localStorage.getItem("authToken")
            if (!jwt) {
                logout(setUser, navigate)
                return
            }
            
            if (profilePicture) {
                const signedId = await uploadFileToS3(profilePicture, jwt);
                if (!signedId) {
                    alert("Error uploading profile picture to S3")
                    return
                }
                const attachResult = await uploadImageToS3({variables: {signedIds: [signedId], resourceId: data.data.editUserProfile.id, resourceType: "user"}})
                if (!attachResult.data?.attachS3Image?.success) {
                    alert("Error attaching profile picture")
                    return
                }
            }
            setUser(data.data.editUserProfile)
            alert("Profile updated successfully")
        }
    }).catch((error: { message?: string }) => {
        console.error("Error: ", error)
        if (error.message && unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } else {
            alert("Error editing user profile")
        }
    })
}