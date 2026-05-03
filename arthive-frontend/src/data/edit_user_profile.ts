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
    editUserProfile: any
) {
    const jwt = localStorage.getItem("authToken")
    if (!jwt) {
        logout(setUser, navigate)
        return
    }
    
    console.log(profilePicture)
    let signedId = null;
    if (profilePicture) {
        signedId = await uploadFileToS3(profilePicture, jwt);
        if (!signedId) {
            alert("Error uploading profile picture to S3")
            return
        }
    }
    editUserProfile({variables: {input: {username, description, email, visibility, profilePicture: signedId, password}}})
    .then((data: any) => {
        console.log(data)
        if (data.data?.editUserProfile) {
            setUser(data.data.editUserProfile)
            alert("Profile updated successfully")
        }
    })
    .catch((error: any) => {
        console.log("error in EditUserProfileDataFetch", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        }
    })
}