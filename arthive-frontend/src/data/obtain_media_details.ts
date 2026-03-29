import type { Media } from "../types/media_type";
import type { User } from "../types/user_types";
import { logout } from "./logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function ObtainMediaDetailsFetch(getMediaInfo: any, navigate: any, setUser: (user: User | null) => void, mediaId: number, setMediaInfo: (mediaInfo: Media | null) => void) {
    getMediaInfo({ variables: { mediaId } })
    .then((data: any) => {
        setMediaInfo(data.data.obtainMediaInfo)
        console.log("data in ObtainMediaDetailsFetch", data.data.obtainMediaInfo)
    })
    .catch((error: any) => {
        console.log("error in ObtainMediaDetailsFetch", error.message)
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
        if (error.message === "Media not found") {
            navigate("/*")
            
        }
    })
}