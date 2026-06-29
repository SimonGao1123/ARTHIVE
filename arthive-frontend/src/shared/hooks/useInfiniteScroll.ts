import { useEffect, useRef } from "react"

type Options = {
    hasNextPage: boolean
    loading: boolean
    onLoadMore: () => void
    root?: HTMLElement | null
    rootMargin?: string
}

export function useInfiniteScroll({
    hasNextPage,
    loading,
    onLoadMore,
    root,
    rootMargin,
}: Options) {
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        const el = sentinelRef.current
        if (!el || !hasNextPage || loading) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) onLoadMore()
            },
            { root: root ?? null, rootMargin: rootMargin ?? "200px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasNextPage, loading, onLoadMore, root, rootMargin])
    return sentinelRef
}
