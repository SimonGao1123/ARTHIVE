import { useState } from "react"

export default function StarRatingMedia({
    rating,
    createReviewFunctionWrapper,
}: {
    rating: number
    setRating: (rating: number) => void
    createReviewFunctionWrapper: (params: {newIfFavorite?: boolean, newIfFinished?: boolean, newReviewContent?: string, newRating?: number}) => void
}) {
    const stars = [1, 2, 3, 4, 5]
    const [hoverRating, setHoverRating] = useState<number | null>(null)
    const [pulseStar, setPulseStar] = useState<number | null>(null)

    const clamp = (n: number, min: number, max: number) =>
        Math.min(max, Math.max(min, n))

    const displayRating = hoverRating ?? rating
    const getFillPercent = (star: number) =>
        clamp(displayRating - (star - 1), 0, 1) * 100

    const handleSet = (newRating: number) => {
        setPulseStar(Math.ceil(newRating))
        window.setTimeout(() => setPulseStar(null), 350)
        createReviewFunctionWrapper({ newRating })
    }

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Rate</p>

            <div
                className="flex gap-2 items-center"
                onMouseLeave={() => setHoverRating(null)}
            >
                {stars.map((star) => {
                    const fillPercent = getFillPercent(star)
                    const isActive = fillPercent > 0
                    const isPulsing = pulseStar === star
                    return (
                        <div
                            key={star}
                            className={
                                "relative w-9 h-9 leading-9 text-[34px] select-none " +
                                (isPulsing ? "scale-125" : "hover:scale-110")
                            }
                            style={{
                                filter: isActive ? "drop-shadow(0 0 6px rgba(245, 158, 11, 0.55))" : "none",
                                transition: "filter 200ms ease-out, transform 200ms ease-out",
                            }}
                        >
                            <span style={{ color: "#3a3a4a" }} aria-hidden>
                                ★
                            </span>

                            <span
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: `${fillPercent}%`,
                                    overflow: "hidden",
                                    color: "#f59e0b",
                                    whiteSpace: "nowrap",
                                    transition: "width 200ms ease-out",
                                }}
                                aria-hidden
                            >
                                ★
                            </span>

                            <button
                                type="button"
                                aria-label={`Set rating to ${star - 0.5}`}
                                onClick={() => handleSet(star - 0.5)}
                                onMouseEnter={() => setHoverRating(star - 0.5)}
                                className="absolute left-0 top-0 w-1/2 h-full opacity-0 cursor-pointer"
                            />

                            <button
                                type="button"
                                aria-label={`Set rating to ${star}`}
                                onClick={() => handleSet(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                className="absolute right-0 top-0 w-1/2 h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center gap-3 mt-1 min-h-[1.25rem]">
                <span className="text-sm text-amber-400 font-medium tabular-nums">
                    {displayRating > 0 ? `${displayRating.toFixed(1)} / 5` : "—"}
                </span>
                {rating > 0 && (
                    <button
                        type="button"
                        onClick={() => createReviewFunctionWrapper({ newRating: 0 })}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    )
}
