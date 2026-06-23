import { useNavigate } from "react-router-dom"
import type { AllUserListType } from "@/types/queries/list_queries_types"
import { contentTypeColor } from "@/shared/utils/contentTypeColors"

export default function ListCard({list}: {list: AllUserListType}) {
    const navigate = useNavigate()
    return (
        <div className="flex gap-8">
            {list.mediaInLists.length > 0 && (
                <div className="flex items-end flex-shrink-0">
                    {list.mediaInLists.slice(0, 3).map((mediaInList, i) => (
                        <img
                            key={mediaInList.media.id}
                            src={mediaInList.media.coverImage || "/default-ARTHIVE-cover.png"}
                            alt={String(mediaInList.media.id)}
                            className="w-16 h-full object-cover rounded-lg border-2 border-[#171519] shadow-md"
                            style={{ marginLeft: i === 0 ? 0 : '-1.5rem', zIndex: i + 1, position: 'relative', minHeight: '7rem' }}
                        />
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <h2
                        onClick={() => navigate(`/list/${list.id}`)}
                        className="text-lg font-semibold text-white hover:text-violet-300 cursor-pointer transition"
                    >
                        {list.name}
                    </h2>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {list.role && (
                            <span className={
                                "text-xs px-2 py-0.5 rounded-full border " +
                                (list.role === "owner"
                                    ? "border-violet-500/40 text-violet-300 bg-violet-500/10"
                                    : list.role === "admin"
                                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                                    : "border-white/10 text-gray-400 bg-white/5")
                            }>
                                {list.role[0].toUpperCase() + list.role.slice(1)}
                            </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${list.ifPrivate ? "border-amber-500/40 text-amber-300 bg-amber-500/10" : "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"}`}>
                            {list.ifPrivate ? "Private" : "Public"}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-gray-300">{list.description || <span className="text-gray-500 italic">No description</span>}</p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {list.contentType.map((ct) => (
                        <span
                            key={ct}
                            className="px-2 py-0.5 rounded-full border"
                            style={{ borderColor: contentTypeColor(ct), color: contentTypeColor(ct), backgroundColor: `${contentTypeColor(ct)}11` }}
                        >
                            {ct}
                        </span>
                    ))}
                    {list.tags.length > 0 && list.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                            #{tag}
                        </span>
                    ))}
                </div>

                <p className="text-xs text-gray-500">
                    Updated {new Date(list.updatedAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    )
}
