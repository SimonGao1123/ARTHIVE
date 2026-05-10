const MAX_PAGES_WIDTH = 2
export function NumberedPagination({ totalPages, pageNum, setPageNum }: { totalPages: number, pageNum: number, setPageNum: (pageNum: number) => void }) {
    const buttons = []

    for (let i = pageNum - MAX_PAGES_WIDTH; i <= pageNum + MAX_PAGES_WIDTH; i++) {
        if (i < 1 || i > totalPages) {
            continue
        }
        buttons.push(
            <button disabled={i === pageNum} key={i} onClick={() => setPageNum(i)}>
                {i}
            </button>
        )
    }
    return (
        <div className="flex gap-2">
            {buttons}
            <input type="number" value={pageNum} onChange={
                (e) => 
                {
                    const newPageNum = Math.min(Math.max(1, Number(e.target.value)), totalPages)
                    if (newPageNum !== pageNum) {
                        setPageNum(newPageNum)
                    }
                }} />
            <button disabled={pageNum >= totalPages} onClick={() => setPageNum(pageNum + 1)}>Next</button>
            <button disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)}>Previous</button>
            <button onClick={() => setPageNum(totalPages)}>Last</button>
            <button onClick={() => setPageNum(1)}>First</button>
        </div>
    )
}