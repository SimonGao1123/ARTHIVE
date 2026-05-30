const MAX_PAGES_WIDTH = 2

export function NumberedPagination({ totalPages, pageNum, setPageNum }: { totalPages: number, pageNum: number, setPageNum: (pageNum: number) => void }) {
    if (totalPages <= 0) return null

    const buttons = []
    for (let i = pageNum - MAX_PAGES_WIDTH; i <= pageNum + MAX_PAGES_WIDTH; i++) {
        if (i < 1 || i > totalPages) continue
        const active = i === pageNum
        buttons.push(
            <button
                disabled={active}
                key={i}
                onClick={() => setPageNum(i)}
                className={
                    "min-w-8 h-8 px-2 rounded-md text-sm transition " +
                    (active
                        ? "bg-violet-500/30 text-violet-200 cursor-default"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white")
                }
            >
                {i}
            </button>
        )
    }

    const navBtn = "h-8 px-3 rounded-md text-sm transition bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5"

    return (
        <div className="flex flex-wrap items-center gap-2 mt-4">
            <button disabled={pageNum <= 1} onClick={() => setPageNum(1)} className={navBtn}>First</button>
            <button disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)} className={navBtn}>Prev</button>
            {buttons}
            <button disabled={pageNum >= totalPages} onClick={() => setPageNum(pageNum + 1)} className={navBtn}>Next</button>
            <button disabled={pageNum >= totalPages} onClick={() => setPageNum(totalPages)} className={navBtn}>Last</button>
            <input
                type="number"
                value={pageNum}
                onChange={(e) => {
                    const newPageNum = Math.min(Math.max(1, Number(e.target.value)), totalPages)
                    if (newPageNum !== pageNum) {
                        setPageNum(newPageNum)
                    }
                }}
                className="w-16 h-8 bg-[#0a090c] border border-white/10 rounded-md px-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
        </div>
    )
}
