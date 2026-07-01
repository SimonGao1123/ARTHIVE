import type { User } from "@/types/domain/user"
import { useState } from "react"
import { useInfiniteScroll } from "@/shared/hooks/useInfiniteScroll"
import type { MediaSearchType } from "@/types/queries/shared_queries_types"
import QuickSearch from "@/features/search/components/QuickSearch"

type MediaQuickSearchProps = {
    setAddedMediaIds: (mediaIds: string[]) => void
    setUser: (user: User) => void
    addedMediaIds: string[]
}

const LIMIT = 10

export default function MediaQuickSearch({setAddedMediaIds, setUser, addedMediaIds}: MediaQuickSearchProps) {
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [hasNextPage, setHasNextPage] = useState<boolean>(false)
    const [loadMore, setLoadMore] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)

    const sentinelRef = useInfiniteScroll({
        hasNextPage,
        loading,
        onLoadMore: () => setLoadMore(loadMore + 1),
    })

    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Add Media</label>
            <div className="bg-[#0a090c] rounded-xl border border-white/5 p-4 flex flex-col gap-1">
                <QuickSearch setSearchResults={setSearchResults} searchType="media" limit={LIMIT} setHasNextPage={setHasNextPage} loadMore={loadMore} setUser={setUser} setLoadMore={setLoadMore} setLoading={setLoading} />

                {searchResults.map((media: MediaSearchType) => (
                    <QuickSearchMediaCard key={media.id} media={media} setAddedMediaIds={setAddedMediaIds} addedMediaIds={addedMediaIds} />
                ))}

                {hasNextPage && <div ref={sentinelRef} className="h-1" />}
            </div>
        </div>
    )
}

function QuickSearchMediaCard({media, setAddedMediaIds, addedMediaIds}: {media: MediaSearchType, setAddedMediaIds: (mediaIds: string[]) => void, addedMediaIds: string[]}) {
    const ifAdded = addedMediaIds.includes(media.id)
    return (
        <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0">
            <img
                width={48}
                height={64}
                src={media.coverImage ?? undefined}
                alt={media.title}
                className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-sm text-white font-medium truncate">{media.title}</span>
                {ifAdded && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300 bg-emerald-500/10 flex-shrink-0">
                        Added
                    </span>
                )}
            </div>
            {ifAdded ? (
                <button
                    onClick={() => setAddedMediaIds(addedMediaIds.filter((id: string) => id !== media.id))}
                    className="bg-red-500/15 text-red-300 border border-red-500/40 hover:bg-red-500/25 px-3 py-1 rounded-full text-xs transition flex-shrink-0"
                >
                    Remove
                </button>
            ) : (
                <button
                    onClick={() => setAddedMediaIds([...addedMediaIds, media.id])}
                    className="bg-violet-500 hover:bg-violet-400 text-white px-3 py-1 rounded-full text-xs transition flex-shrink-0"
                >
                    + Add
                </button>
            )}
        </div>
    )
}
