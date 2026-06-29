import type { Media } from "@/types/domain/media";
import type { User } from "@/types/domain/user";
import { handleMutationUnauth } from "@/data/auth/handleMutationUnauth";

export function ObtainMediaDetailsFetch(getMediaInfo: any, navigate: any, setUser: (user: User | null) => void, mediaId: number, setMediaInfo: (mediaInfo: Media | null) => void) {
    getMediaInfo({ variables: { mediaId } })
    .then((data: any) => {
        setMediaInfo(data.data.obtainMediaInfo)
    })
    .catch((error: any) => {
        if (handleMutationUnauth(error, setUser, navigate)) return
        if (error.message === "Media not found") {
            navigate("/*")
        }
    })
}
