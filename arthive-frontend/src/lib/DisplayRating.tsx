
export default function DisplayRating({rating}: {rating: number}) {
    const stars = []
    while (stars.length < 5) {
        if (rating >= 1) {
            stars.push(<span key={stars.length} style={{color: "#f59e0b"}}>★</span>)
            rating -= 1
        } else if (rating === 0.5) {
            // Half star
            stars.push(
            <span key={stars.length} style={{ position: "relative", display: "inline-block" }}>
                {/* gray star background */}
                <span style={{ color: "#d1d5db" }}>★</span>

                {/* yellow overlay for half */}
                <span
                style={{
                    color: "#f59e0b",
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "50%",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                }}
                >
                ★
                </span>
            </span>
            );
            rating -= 0.5
        } else {
            stars.push(<span key={stars.length} style={{color: "#d1d5db"}}>★</span>)
        }
    }
    return (
        <div>
            {stars}
        </div>
    )
}