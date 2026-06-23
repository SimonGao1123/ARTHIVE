type DisplayRatingSize = "sm" | "md" | "lg"

const SIZE_CLASSES: Record<DisplayRatingSize, string> = {
    sm: "text-sm leading-none",
    md: "text-lg leading-none",
    lg: "text-2xl leading-none",
}

export default function DisplayRating({rating, size = "md"}: {rating: number, size?: DisplayRatingSize}) {
    const clamped = Math.max(0, Math.min(5, rating))
    const stars = []
    for (let i = 0; i < 5; i++) {
        const fillFraction = Math.max(0, Math.min(1, clamped - i))
        if (fillFraction >= 1) {
            stars.push(<span key={i} style={{color: "#f59e0b"}}>★</span>)
        } else if (fillFraction <= 0) {
            stars.push(<span key={i} style={{color: "#d1d5db"}}>★</span>)
        } else {
            stars.push(
                <span key={i} style={{ position: "relative", display: "inline-block" }}>
                    <span style={{ color: "#d1d5db" }}>★</span>
                    <span
                        style={{
                            color: "#f59e0b",
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: `${fillFraction * 100}%`,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                        }}
                    >
                        ★
                    </span>
                </span>
            )
        }
    }
    return (
        <div className={`inline-flex items-center ${SIZE_CLASSES[size]}`}>
            {stars}
        </div>
    )
}
