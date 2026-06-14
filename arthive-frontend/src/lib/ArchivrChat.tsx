import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useMutation, useLazyQuery } from "@apollo/client/react"
import { useNavigate } from "react-router-dom"
import {
    MESSAGE_ARCHIVR,
    type MessageArchivrInput,
    type MessageArchivrResponse,
} from "../types/mutations/archivr_send_message_mutation"
import {
    OBTAIN_ARCHIVR_CONVERSATION,
    type ArchivrMessage,
    type ObtainArchivrConversationInput,
    type ObtainArchivrConversationResponse,
} from "../types/queries/archivr_chat_request_query"
import { requestArchivrChatFunction } from "../data/request_archivr_chat"
import { sendArchivrMessageFunction } from "../data/send_archivr_message"
import type { User } from "../types/user_types"
import { ArchivrLogo } from "./StyledComponents"
import { useInfiniteScroll } from "./useInfiniteScroll"

const LIMIT = 6

type ArchivrChatProps = {
    mediaId: string
    setUser: (user: User | null) => void
    isOpen: boolean
    onClose: () => void
}

function renderContent(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith("*") && part.endsWith("*")) {
            return <strong key={i}>{part.slice(1, -1)}</strong>
        }
        return part
    })
}

export default function ArchivrChat({ mediaId, setUser, isOpen, onClose }: ArchivrChatProps) {
    const navigate = useNavigate()

    const [messages, setMessages] = useState<ArchivrMessage[]>([])
    const [cursor, setCursor] = useState<string | null>(null)
    const [ifNextPage, setIfNextPage] = useState(true)
    const [input, setInput] = useState("")
    const [loadCount, setLoadCount] = useState(0)
    const [pending, setPending] = useState(false)
    const [hasLoadedFirst, setHasLoadedFirst] = useState(false)

    const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)
    const prevScrollHeightRef = useRef<number | null>(null)

    const [obtainArchivrConversation, { loading, error }] = useLazyQuery<
        ObtainArchivrConversationResponse,
        ObtainArchivrConversationInput
    >(OBTAIN_ARCHIVR_CONVERSATION, { fetchPolicy: "no-cache" })

    const [messageArchivr, { error: sendError }] = useMutation<
        MessageArchivrResponse,
        MessageArchivrInput
    >(MESSAGE_ARCHIVR)

    useEffect(() => {
        if (!isOpen) return
        if (loadCount === 0 && hasLoadedFirst) return
        requestArchivrChatFunction(
            mediaId,
            cursor,
            setCursor,
            LIMIT,
            obtainArchivrConversation,
            setMessages,
            navigate,
            setUser,
            setIfNextPage,
        )
        if (!hasLoadedFirst) setHasLoadedFirst(true)
    }, [isOpen, loadCount])

    useLayoutEffect(() => {
        const el = scrollEl
        if (!el) return
        if (prevScrollHeightRef.current !== null) {
            el.scrollTop = el.scrollHeight - prevScrollHeightRef.current
            prevScrollHeightRef.current = null
        } else {
            el.scrollTop = el.scrollHeight // automatically scroll to the bottom of the chat if not scrolling up to load text
        }
    }, [messages.length, scrollEl])

    const onLoadMore = useCallback(() => {
        if (scrollEl) prevScrollHeightRef.current = scrollEl.scrollHeight
        setLoadCount((prev) => prev + 1)
    }, [scrollEl])

    const sentinelRef = useInfiniteScroll({
        hasNextPage: ifNextPage && cursor !== null,
        loading,
        onLoadMore,
        root: scrollEl,
        rootMargin: "0px",
    })

    function handleSend() {
        const q = input.trim()
        if (q.length < 3 || pending) return
        const optimisticId = `local-${Date.now()}`
        const optimistic: ArchivrMessage = {
            id: optimisticId,
            content: q,
            role: "user",
            createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, optimistic])
        setInput("")
        setPending(true)
        sendArchivrMessageFunction(
            messageArchivr,
            mediaId,
            q,
            optimisticId,
            setMessages,
            setUser,
            navigate,
        ).finally(() => setPending(false))
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const canSend = input.trim().length >= 3 && !pending

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4" onClick={onClose}>
            <div
                className="w-full max-w-md h-[70vh] flex flex-col rounded-2xl border border-violet-500/30 bg-[#0f0d11] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#171519]">
                    <div className="flex items-center gap-2">
                        <ArchivrLogo size={22} />
                        <span className="text-sm font-semibold text-violet-300">Ask Archivr</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white text-xl leading-none transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Messages */}
                <div
                    ref={setScrollEl}
                    className="flex-1 overflow-y-auto flex flex-col gap-2 p-4"
                >
                    <div ref={sentinelRef} />
                    {loading && (
                        <p className="text-gray-400 text-xs text-center py-1">Loading…</p>
                    )}
                    {!loading && !ifNextPage && messages.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-6">
                            Ask Archivr anything about this title.
                        </p>
                    )}
                    {messages.map((m) => {
                        const isUser = m.role === "user"
                        return (
                            <div
                                key={m.id}
                                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                            >
                                {!isUser && (
                                    <div className="mr-2 mt-1 shrink-0">
                                        <ArchivrLogo size={18} />
                                    </div>
                                )}
                                <div
                                    className={
                                        isUser
                                            ? "max-w-[80%] rounded-2xl bg-violet-500/20 text-white text-sm px-3.5 py-2 whitespace-pre-wrap"
                                            : "max-w-[80%] rounded-2xl bg-[#1e1b22] border border-white/5 text-gray-200 text-sm px-3.5 py-2 whitespace-pre-wrap"
                                    }
                                >
                                    {isUser ? m.content : renderContent(m.content)}
                                </div>
                            </div>
                        )
                    })}
                    {pending && (
                        <div className="flex justify-start">
                            <div className="mr-2 mt-1 shrink-0">
                                <ArchivrLogo size={18} />
                            </div>
                            <div className="max-w-[80%] rounded-2xl bg-[#1e1b22] border border-white/5 text-gray-400 text-sm px-3.5 py-2 italic">
                                Archivr is thinking…
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-red-400 text-xs px-4 pb-1">{error.message}</p>
                )}
                {sendError && (
                    <p className="text-red-400 text-xs px-4 pb-1">{sendError.message}</p>
                )}

                {/* Input */}
                <div className="flex gap-2 p-3 border-t border-white/5 bg-[#171519]">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Archivr…"
                        rows={1}
                        className="flex-1 bg-[#0a090c] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!canSend}
                        className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

