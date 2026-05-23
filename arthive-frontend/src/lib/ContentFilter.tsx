import { CONTENT_TYPE_COLORS, type ContentType } from "./contentTypeColors"

type FilterValue = ContentType | "all"

const FILTERS: { value: FilterValue, label: string }[] = [
    { value: "all", label: "All" },
    { value: "book", label: "Books" },
    { value: "film", label: "Films" },
    { value: "series", label: "Series" },
    { value: "game", label: "Games" },
]

export default function ContentFilter({currContentType, setContentType}:
    {currContentType: FilterValue,
        setContentType: (contentType: FilterValue) => void}) {
    return (
        <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => {
                const active = currContentType === value
                const color = value === "all" ? "#a78bfa" : CONTENT_TYPE_COLORS[value]
                return (
                    <button
                        key={value}
                        onClick={() => setContentType(value)}
                        className="px-4 py-1.5 rounded-full text-sm transition border"
                        style={
                            active
                                ? { backgroundColor: `${color}22`, borderColor: color, color: color }
                                : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "#9ca3af" }
                        }
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}
