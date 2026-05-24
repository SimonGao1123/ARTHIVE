import type { CommunityThread } from "../types/queries/community_request_queries";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { EDIT_THREAD_MUTATION, type EditThreadResponse, type EditThreadInput } from "../types/mutations/thread_mutations";
import { InputField } from "../pages/admin_sub_pages/UploadMedia";
import PreviewImageDisplay from "./PreviewImageDisplay";
import { handleAttachImages } from "./HandleImageUpload";
import { useRef } from "react";
import type { User } from "../types/user_types";
import { UPLOAD_IMAGE_TO_S3_MUTATION } from "../types/mutations/upload_media_mutation";
import { editCommunityThread } from "../data/edit_community_thread";
export default function EditThreadComponent({thread, setUser, setEditPopupOpen}: {thread: CommunityThread, setUser: (user: User | null) => void, setEditPopupOpen: (editPopupOpen: boolean) => void}) {
    const navigate = useNavigate()

    const [uploadImageToS3] = useMutation(UPLOAD_IMAGE_TO_S3_MUTATION)

    const [title, setTitle] = useState<string>(thread.title || "")
    const [content, setContent] = useState<string>(thread.content || "")
    const [existingImages, setExistingImages] = useState<{signedId: string, url: string}[]>(thread.imageDetails || [])
    const [reviewId, setReviewId] = useState<string | null>(thread.review ? `/review_info/${thread.review?.id}` : "")

    const [editThread, { loading, error }] = useMutation<EditThreadResponse, EditThreadInput>(EDIT_THREAD_MUTATION)

    const [newImages, setNewImages] = useState<{file: File, url: string, uuid: string}[]>([])

    const uploadFileRef = useRef<HTMLInputElement>(null)

    function handleEditThread(ifDeleteThread: boolean) {
        if (!ifDeleteThread &&content === "") {
            alert("Content is required")
            return
        }
        if (!ifDeleteThread && title && (thread?.parentThreadId || thread?.rootThreadId)) {
            alert("Title cannot be present for non-root threads")
            return
        }
        
        const normalizedReviewId = reviewId !== "" && reviewId !== null ? reviewId.split("/").pop() : null
        editCommunityThread(thread.id, content, title === "" ? null : title, normalizedReviewId ?? null, ifDeleteThread, editThread, setUser, navigate, uploadImageToS3, newImages)
        setEditPopupOpen(false)
    }


    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 arthive-fade-in"
            onPaste={(e) => handleAttachImages({files: Array.from(e.clipboardData.files), newImages: newImages, setNewImages: setNewImages})}
        >
            <div
                className="bg-[#171519] rounded-2xl border border-white/5 p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Edit Thread</p>
                    <button
                        type="button"
                        onClick={() => setEditPopupOpen(false)}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm">{error.message}</p>}
                {loading && <p className="text-gray-400 text-sm">Loading…</p>}

                <PreviewImageDisplay newImages={newImages} setNewImages={setNewImages} existingImages={existingImages} setExistingImages={setExistingImages} resourceId={Number(thread.id) || null} resourceType="community_thread" />

                {thread.parentThreadId == null && thread.rootThreadId == null
                    ? <InputField type="text" title="Title" value={title} setter={setTitle} can_be_empty={false} />
                    : null
                }
                <InputField type="textarea" title="Content" value={content} setter={setContent} can_be_empty={false} />

                <input
                    type="url"
                    value={reviewId ?? ""}
                    onChange={(e) => setReviewId(e.target.value || null)}
                    placeholder="Review link (optional)"
                    className="w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />

                <input type="file" multiple ref={uploadFileRef} hidden onChange={(e) => {
                    handleAttachImages({files: Array.from(e.target.files || []), newImages: newImages, setNewImages: setNewImages})
                    uploadFileRef.current!.value = ""
                }} />

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => uploadFileRef.current?.click()}
                        className="text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition"
                    >
                        Attach Images
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleEditThread(true)}
                            className="text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-full transition"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={() => handleEditThread(false)}
                            className="text-sm text-white bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed px-5 py-2 rounded-full transition"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

