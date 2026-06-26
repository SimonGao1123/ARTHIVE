import type { RoleFilter } from "@/types/queries/list_queries_types"

const ROLE_OPTIONS: { value: RoleFilter, label: string }[] = [
    { value: null,     label: "All" },
    { value: "owner",  label: "Owner" },
    { value: "admin",  label: "Admin" },
    { value: "member", label: "Member" },
    { value: "saved",  label: "Saved" },
]

type RoleFilterProps = {
    currRole: RoleFilter
    setRole: (role: RoleFilter) => void
}

export default function RoleFilterPanel({currRole, setRole}: RoleFilterProps) {
    return (
        <div className="bg-[#171519] rounded-2xl border border-white/5 p-4 flex flex-col gap-3 w-48 flex-shrink-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Role</p>
            {ROLE_OPTIONS.map(({value, label}) => {
                const active = currRole === value
                return (
                    <label key={label} className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            name="role-filter"
                            checked={active}
                            onChange={() => setRole(value)}
                            className="accent-violet-500"
                        />
                        <span className={active ? "text-white text-sm" : "text-gray-400 text-sm group-hover:text-white transition"}>
                            {label}
                        </span>
                    </label>
                )
            })}
        </div>
    )
}
