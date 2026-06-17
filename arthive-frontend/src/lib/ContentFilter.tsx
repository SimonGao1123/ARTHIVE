import { CONTENT_TYPE_COLORS, type ContentType } from "./contentTypeColors"

type FilterValue = ContentType | "all"

const FILTERS: { value: FilterValue, label: string }[] = [
    { value: "all", label: "All" },
    { value: "film", label: "Films" },
    { value: "series", label: "Series" },
    { value: "book", label: "Books" },
    { value: "game", label: "Games" },
]

export default function ContentFilter({currContentType, setContentType}:
    {currContentType: FilterValue,
        setContentType: (contentType: FilterValue) => void}) {
    return (
        <div className="flex w-full border-b border-white/10">
            {FILTERS.map(({ value, label }) => {
                const active = currContentType === value
                const color = value === "all" ? "#a78bfa" : CONTENT_TYPE_COLORS[value]
                return (
                    <button
                        key={value}
                        onClick={() => setContentType(value)}
                        className="flex-1 py-3 text-sm font-semibold uppercase tracking-wider relative transition-all duration-150 group"
                        style={{ color: active ? color : "#6b7280" }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af" }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#6b7280" }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
                                style={{ backgroundColor: color }}
                            />
                            {label}
                        </span>
                        <span
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-opacity duration-150"
                            style={{
                                backgroundColor: color,
                                opacity: active ? 1 : 0,
                            }}
                        />
                    </button>
                )
            })}
        </div>
    )
}
