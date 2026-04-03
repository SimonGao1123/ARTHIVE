export default function StarRatingMedia({
    rating,
    setRating,
  }: {
    rating: number
    setRating: (rating: number) => void
  }) {
    const stars = [1, 2, 3, 4, 5]
  
    const clamp = (n: number, min: number, max: number) =>
      Math.min(max, Math.max(min, n))
  
    const getFillPercent = (star: number) => {
      // star=1 fills from rating 0..1, star=2 fills from 1..2, etc.
      return clamp(rating - (star - 1), 0, 1) * 100
    }
  
    return (
      <div>
        <p>Rate media</p>
  
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {stars.map((star) => (
            <div
              key={star}
              style={{
                position: "relative",
                width: 28,
                height: 28,
                lineHeight: "28px",
                fontSize: 28,
                userSelect: "none",
              }}
            >
              {/* empty star */}
              <span style={{ color: "#d1d5db" }} aria-hidden>
                ★
              </span>
  
              {/* filled amount (0%, 50%, 100%) */}
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${getFillPercent(star)}%`,
                  overflow: "hidden",
                  color: "#f59e0b",
                  whiteSpace: "nowrap",
                }}
                aria-hidden
              >
                ★
              </span>
  
              {/* click left half => x.5 */}
              <button
                type="button"
                aria-label={`Set rating to ${star - 0.5}`}
                onClick={() => setRating(star - 0.5)}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "50%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
  
              {/* click right half => x.0 */}
              <button
                type="button"
                aria-label={`Set rating to ${star}`}
                onClick={() => setRating(star)}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "50%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
            </div>
          ))}
  
          <button type="button" onClick={() => setRating(0)}>
            Clear
          </button>
        </div>
  
        <p>{rating.toFixed(1)} / 5</p>
      </div>
    )
  }