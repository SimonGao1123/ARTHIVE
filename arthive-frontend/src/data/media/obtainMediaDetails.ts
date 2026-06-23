import type { Media } from "@/types/domain/media";
import type { User } from "@/types/domain/user";
import { logout } from "@/data/auth/logout";

const unauth_messages = ["EXPIRED_TOKEN", "INVALID_TOKEN", "NO_TOKEN", "USER_NOT_FOUND"]

export function ObtainMediaDetailsFetch(getMediaInfo: any, navigate: any, setUser: (user: User | null) => void, mediaId: number, setMediaInfo: (mediaInfo: Media | null) => void) {
    getMediaInfo({ variables: { mediaId } })
    .then((data: any) => {
        setMediaInfo(data.data.obtainMediaInfo)
    })
    .catch((error: any) => {
        if (unauth_messages.includes(error.message)) {
            logout(setUser, navigate)
        } 
        if (error.message === "Media not found") {
            navigate("/*")
            
        }
    })
}