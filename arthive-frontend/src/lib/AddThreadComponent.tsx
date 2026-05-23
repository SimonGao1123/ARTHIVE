import { useMutation } from "@apollo/client/react"
import { CREATE_THREAD_MUTATION, type CreateThreadInput, type CreateThreadResponse } from "../types/mutations/thread_mutations"
import type { User } from "../types/user_types"
import { useRef, useState, type Dispatch, type SetStateAction } from "react"
import { createThreadMutation } from "../data/create_thread_mutation"
import { useNavigate } from "react-router-dom"
import type { CommunityThread } from "../types/queries/community_request_queries"
import { UPLOAD_IMAGE_TO_S3_MUTATION } from "../types/mutations/upload_media_mutation"
import { TrashIcon } from "./StyledComponents"

type AddThreadComponentProps = {
    media_id: string
    setUser: (user: User | null) => void
    parentThreadId: string | null
    rootThreadId: string | null
    setThreads: Dispatch<SetStateAction<CommunityThread[]>>
}

export function AddThreadComponent({media_id, setUser, parentThreadId, rootThreadId, setThreads}: AddThreadComponentProps) {
    const [open, setOpen] = useState(false)
    const isRoot = parentThreadId === null && rootThreadId === null

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-full text-sm transition self-start"
            >
                <span className="text-lg leading-none">+</span>
                {isRoot ? "New Thread" : "Reply"}
            </button>

            {open && (
                <AddThreadModal
                    media_id={media_id}
                    setUser={setUser}
                    parentThreadId={parentThreadId}
                    rootThreadId={rootThreadId}
                    setThreads={setThreads}
                    isRoot={isRoot}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    )
}

type AddThreadModalProps = AddThreadComponentProps & {
    isRoot: boolean
    onClose: () => void
}

function AddThreadModal({media_id, setUser, parentThreadId, rootThreadId, setThreads, isRoot, onClose}: AddThreadModalProps) {
    const [createThread, {loading, error}] = useMutation<CreateThreadResponse, CreateThreadInput>(CREATE_THREAD_MUTATION)
    const [content, setContent] = useState("")
    const [title, setTitle] = useState<string | null>(null)
    const navigate = useNavigate()
    const [newImages, setNewImages] = useState<{file: File, url: string, uuid: string}[]>([])
    const [uploadImageToS3] = useMutation(UPLOAD_IMAGE_TO_S3_MUTATION)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [reviewRef, setReviewRef] = useState<string | null>(null)

    function handleCreateThread() {
        if (content === "") return
        const cleanedReviewRef = reviewRef?.trim().split("/").pop() // obtains the review id from the last part of the url
        if (cleanedReviewRef && !cleanedReviewRef.match(/^\d+$/)) {
            alert("Invalid review link")
            return
        }
        createThreadMutation(createThread, media_id, content, title, parentThreadId, rootThreadId, setUser, navigate, setThreads, newImages, uploadImageToS3, cleanedReviewRef ?? null)
        onClose()
    }

    function handleAttachImages(files: File[]) {
        for (const file of files) {
            if (newImages.length >= 5) return
            if (file.type.split("/")[0] !== "image") continue
            if (file.size > 2 * 1024 * 1024) {
                alert("Image is too large (max 2MB)")
                continue
            }
            const url = URL.createObjectURL(file)
            const uuid = crypto.randomUUID()
            setNewImages((prev) => [...prev, {file, url, uuid}])
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 arthive-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                onPaste={(e) => handleAttachImages(Array.from(e.clipboardData.files))}
            >
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                        {isRoot ? "New Thread" : "Reply"}
                    </p>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm">{error.message}</p>}

                {isRoot && (
                    <input
                        type="text"
                        value={title ?? ""}
                        onChange={(e) => setTitle(e.target.value || null)}
                        placeholder="Title (optional)"
                        className="w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                )}

                <textarea
                    autoFocus
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isRoot ? "Start a discussion…" : "Write a reply…"}
                    rows={4}
                    className="w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-y transition-colors"
                />

                <div className="flex flex-col gap-2">
                    <input 
                    type="url" 
                    value={reviewRef ?? ""} 
                    
                    onChange={(e) => setReviewRef(e.target.value || null)} 
                    placeholder="Paste Review Link (optional)" 
                    className="w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                {newImages.length > 0 && (
                    <ImagesPreview images={newImages} setNewImages={setNewImages} />
                )}

                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={newImages.length >= 5}
                        className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm transition flex items-center gap-1.5"
                    >
                        📎 Attach
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateThread}
                            disabled={loading || content === ""}
                            className="bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm transition"
                        >
                            {loading ? "Posting…" : isRoot ? "Post Thread" : "Reply"}
                        </button>
                    </div>
                </div>

                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        handleAttachImages(Array.from(e.target.files || []))
                        fileInputRef.current!.value = ""
                    }}
                />
            </div>
        </div>
    )
}

function ImagesPreview({images, setNewImages}: {images: {file: File, url: string, uuid: string}[], setNewImages: Dispatch<SetStateAction<{file: File, url: string, uuid: string}[]>>}) {
    return (
        <div className="flex flex-wrap gap-2">
            {images.map((image) => (
                <div key={image.uuid} className="relative group">
                    <img src={image.url} alt={image.file.name} className="h-20 w-auto rounded-lg object-cover" />
                    <button
                        onClick={() => setNewImages((prev) => prev.filter((img) => img.uuid !== image.uuid))}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                        <TrashIcon />
                    </button>
                </div>
            ))}
        </div>
    )
}
