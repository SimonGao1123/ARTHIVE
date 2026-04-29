export default function ContentFilter({currContentType, setContentType}:
    {currContentType: "book" | "film" | "series" | "game" | "all", 
        setContentType: (contentType: "book" | "film" | "series" | "game" | "all") => void}) {
    return (
        <div>
            <button style={{backgroundColor: currContentType === "book" ? "lightgray" : "white"}} onClick={() => setContentType("book")}>Books</button>
            <button style={{backgroundColor: currContentType === "film" ? "lightgray" : "white"}} onClick={() => setContentType("film")}>Films</button>
            <button style={{backgroundColor: currContentType === "series" ? "lightgray" : "white"}} onClick={() => setContentType("series")}>Series</button>
            <button style={{backgroundColor: currContentType === "game" ? "lightgray" : "white"}} onClick={() => setContentType("game")}>Games</button>
            <button style={{backgroundColor: currContentType === "all" ? "lightgray" : "white"}} onClick={() => setContentType("all")}>All</button>
        </div>
    )
}