import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth"
import type { User } from "@/types/domain/user"
import { uploadFileToS3 } from "@/data/media/uploadFileToS3"


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
    if (username === null || username === "") {
        alert("Username is required")
        return
    }
    if (email === null || email === "") {
        alert("Email is required")
        return
    }
    if (visibility === null) {
        alert("Visibility is required")
        return
    }
    
    editUserProfile({variables: {input: {
        username, 
        description: description ? description : null, 
        email, 
        visibility, 
        password: password ? password : null,
    }}})
    .then(async (data: any) => {
        if (data.data?.editUserProfile) {
            if (profilePicture) {
                const signedId = await uploadFileToS3(profilePicture);
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
        if (!handleMutationUnauth(error, setUser, navigate)) {
            alert("Error editing user profile")
        }
    })
}