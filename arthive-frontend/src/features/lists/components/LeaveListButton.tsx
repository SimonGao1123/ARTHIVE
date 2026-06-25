import { LEAVE_LIST_MUTATION } from "@/apollo/mutations/list_mutations"
import { leaveListFunction } from "@/data/lists/leaveListFunction"
import type { User } from "@/types/domain/user"
import type { LeaveListResponse } from "@/types/mutations/list_mutations_types"
import type { LeaveListInput } from "@/types/mutations/list_mutations_types"
import { useMutation } from "@apollo/client/react"
import { useState } from "react"

type LeaveListButtonProps = {
    listId: string
    setUser: (user: User) => void
    navigate: any
}
export default function LeaveListButton({listId, setUser, navigate}: LeaveListButtonProps) {
    const [leaveList, {loading}] = useMutation<LeaveListResponse, LeaveListInput>(LEAVE_LIST_MUTATION)
    const [showConfirm, setShowConfirm] = useState(false)

    function handleConfirm() {
        leaveListFunction(listId, setUser, navigate, leaveList)
        setShowConfirm(false)
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Leave List
            </button>

            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="bg-[#171519] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-white">Leave this list?</h2>
                        <p className="text-sm text-gray-400">
                            You will lose access to this list and will need to be re-added to rejoin.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="px-4 py-1.5 rounded-full text-sm border border-white/10 text-gray-300 hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={loading}
                                className="px-4 py-1.5 rounded-full text-sm bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {loading ? "Leaving…" : "Leave"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
