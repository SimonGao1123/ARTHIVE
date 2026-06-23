export type LikesType = "media" | "reviews" | "lists"

const FILTERS: { value: LikesType, label: string }[] = [
    { value: "media",   label: "Media" },
    { value: "reviews", label: "Reviews" },
    { value: "lists",   label: "Lists" },
]

const ACCENT = "#a78bfa"

export default function TypeFilter({currType, setType}:
    {currType: LikesType,
        setType: (type: LikesType) => void}) {
    return (
        <div className="flex w-full border-b border-white/10">
            {FILTERS.map(({ value, label }) => {
                const active = currType === value
                return (
                    <button
                        key={value}
                        onClick={() => setType(value)}
                        className="flex-1 py-3 text-sm font-semibold uppercase tracking-wider relative transition-all duration-150 group"
                        style={{ color: active ? ACCENT : "#6b7280" }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af" }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#6b7280" }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
                                style={{ backgroundColor: ACCENT }}
                            />
                            {label}
                        </span>
                        <span
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-opacity duration-150"
                            style={{
                                backgroundColor: ACCENT,
                                opacity: active ? 1 : 0,
                            }}
                        />
                    </button>
                )
            })}
        </div>
    )
}
