import { useMutation } from "@apollo/client/react"
import type { User } from "../types/user_types"
import { EDIT_USER_PROFILE_MUTATION, type EditUserProfileInput, type EditUserProfileResponse } from "../types/mutations/edit_user_profile_mutation"
import { useRef, useState, useEffect } from "react"
import { LOGIN_USER, type LoginInput, type LoginUserMutation} from "../types/mutations/user_login_mutations"
import { EditUserProfileDataFetch } from "../data/edit_user_profile"
import { useNavigate } from "react-router-dom"
import { UPLOAD_IMAGE_TO_S3_MUTATION } from "../types/mutations/upload_media_mutation"

type EditUserProfileProps = {
    setUser: (user: User | null) => void
    user: User | null
}

export default function EditUserProfile({ setUser, user }: EditUserProfileProps) {
    const [editUserProfile, { loading, error }] = useMutation<EditUserProfileResponse, EditUserProfileInput>(EDIT_USER_PROFILE_MUTATION)
    const [uploadImageToS3] = useMutation(UPLOAD_IMAGE_TO_S3_MUTATION)
    const [username, setUsername] = useState<string | null>(user?.username || null)
    const [description, setDescription] = useState<string | null>(user?.description || null)
    const [email, setEmail] = useState<string | null>(user?.email || null)
    const [visibility, setVisibility] = useState<string | null>(user?.visibility || null)

    useEffect(() => {
        if (user) {
            setUsername(user.username || null)
            setDescription(user.description || null)
            setEmail(user.email || null)
            setVisibility(user.visibility || null)
        }
    }, [user])

    const profilePictureRef = useRef<HTMLInputElement>(null)
    const [profilePicture, setProfilePicture] = useState<File | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    const [ifChangingPassword, setIfChangingPassword] = useState<boolean>(false)
    const [ifViewPassword, setIfViewPassword] = useState<boolean>(false)

    const navigate = useNavigate()

    const clearChanges = () => {
        setUsername(user?.username || null)
        setDescription(user?.description || null)
        setEmail(user?.email || null)
        setVisibility(user?.visibility || null)
        setProfilePicture(null)
        if (profilePictureRef.current) {
            profilePictureRef.current.value = ""
        }
        setPassword(null)
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {loading && (
                <p className="text-gray-400 text-sm text-center py-2">Saving changes…</p>
            )}
            {error && (
                <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                    {error.message}
                </p>
            )}

            <div className="bg-[#171519] rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
                <h1 className="text-lg font-semibold text-white">Edit Profile</h1>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        await EditUserProfileDataFetch(setUser, navigate, username, description, email, visibility, profilePicture, password, editUserProfile, uploadImageToS3)
                        clearChanges()
                    }}
                    className="flex flex-col gap-5"
                >
                    <FileInput
                        label="Profile Picture"
                        value={profilePicture}
                        onChange={setProfilePicture}
                        useRef={profilePictureRef}
                        defaultFile={user?.profilePicture || ""}
                    />

                    <div className="border-t border-white/5" />

                    <InputField label="Username" value={username} onChange={setUsername} type="text" />
                    <InputField label="Description" value={description} onChange={setDescription} type="textarea" />
                    <InputField label="Email" value={email} onChange={setEmail} type="text" />
                    <InputField label="Visibility" value={visibility} onChange={setVisibility} type="switch" />

                    <div className="border-t border-white/5" />

                    {/* Password section */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</p>
                        {user && ifChangingPassword ? (
                            <PasswordInput
                                setIfChangingPassword={setIfChangingPassword}
                                setPassword={setPassword}
                                user={user}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIfChangingPassword(true)}
                                className="self-start px-4 py-2 rounded-lg text-sm border border-white/10 text-gray-400 hover:text-white hover:border-violet-500/50 transition"
                            >
                                Change password
                            </button>
                        )}

                        {password && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2.5">
                                    <span className="text-sm text-white font-mono">
                                        {ifViewPassword ? password : "••••••••••••"}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIfViewPassword(v => !v)}
                                    className="text-xs text-gray-500 hover:text-violet-300 transition whitespace-nowrap"
                                >
                                    {ifViewPassword ? "Hide" : "Show new password"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-white/5" />

                    {/* Action buttons */}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                clearChanges()
                                setIfChangingPassword(false)
                            }}
                            className="px-4 py-2 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition"
                        >
                            Clear changes
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-full text-sm bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/30 disabled:cursor-not-allowed text-white transition"
                        >
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function PasswordInput({ setIfChangingPassword, setPassword, user }: { setIfChangingPassword: (value: boolean) => void, setPassword: (value: string | null) => void, user: User }) {
    const [currentPassword, setCurrentPassword] = useState<string | null>(null)
    const [confirmPassword, setConfirmPassword] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState<string | null>(null)
    const [loginUser, { error }] = useMutation<LoginUserMutation, LoginInput>(LOGIN_USER)

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error.message}
                </p>
            )}
            <InputField label="Current Password" value={currentPassword} onChange={setCurrentPassword} type="password" />
            <InputField label="New Password" value={newPassword} onChange={setNewPassword} type="password" />
            <InputField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => {
                        if (!currentPassword || !newPassword || !confirmPassword) {
                            alert("Please fill in all fields")
                            return
                        }
                        if (newPassword !== confirmPassword) {
                            alert("New password and confirm password do not match")
                            return
                        }
                        if (newPassword.length < 8) {
                            alert("New password must be at least 8 characters long")
                            return
                        }
                        if (newPassword === currentPassword) {
                            alert("New password cannot be the same as the current password")
                            return
                        }
                        loginUser({ variables: { input: { email: user.email, password: currentPassword } } })
                            .then((data) => {
                                if (data.data?.login.user.id === user.id) {
                                    setPassword(newPassword)
                                    setNewPassword(null)
                                    setConfirmPassword(null)
                                    setCurrentPassword(null)
                                } else {
                                    alert("Current password is incorrect")
                                }
                            })
                            .catch((err) => {
                                alert("Error: " + err.message)
                            })
                    }}
                    className="px-4 py-2 rounded-full text-sm bg-violet-500 hover:bg-violet-400 text-white transition"
                >
                    Save password
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIfChangingPassword(false)
                        setCurrentPassword(null)
                        setNewPassword(null)
                        setConfirmPassword(null)
                    }}
                    className="px-4 py-2 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

function InputField({ label, value, onChange, type }: { label: string, value: string | null, onChange: (value: string | null) => void, type: string }) {
    const baseInput = "w-full bg-[#0a090c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"

    let inputField = null
    if (type === "textarea") {
        inputField = (
            <textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value !== "" ? e.target.value : null)}
                className={baseInput + " min-h-24 resize-y"}
            />
        )
    } else if (type === "text" || type === "email" || type === "password") {
        inputField = (
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value !== "" ? e.target.value : null)}
                className={baseInput}
            />
        )
    } else if (type === "switch") {
        const isPublic = value === "public"
        inputField = (
            <button
                type="button"
                onClick={() => onChange(isPublic ? "private" : "public")}
                className={
                    "self-start px-4 py-2 rounded-lg text-sm border transition " +
                    (isPublic
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20")
                }
            >
                {isPublic ? "Public" : "Private"} — click to toggle
            </button>
        )
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</label>
            {inputField}
        </div>
    )
}

function FileInput({ label, value, onChange, useRef, defaultFile }: { label: string, value: File | null, onChange: (value: File | null) => void, useRef: React.RefObject<HTMLInputElement | null>, defaultFile: string }) {
    const previewSrc = value ? URL.createObjectURL(value) : (defaultFile || "/default-ARTHIVE-pfp.png")

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</label>
            <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                    <img
                        width={64}
                        height={64}
                        src={previewSrc}
                        alt="Profile picture preview"
                        className="w-16 h-16 rounded-full object-cover border border-white/10"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                if (useRef.current) {
                                    useRef.current.value = ""
                                    URL.revokeObjectURL(previewSrc)
                                    onChange(null)
                                }
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-[#0a090c] border border-white/20 rounded-full text-gray-400 hover:text-white text-xs flex items-center justify-center transition"
                            aria-label="Remove photo"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={() => useRef.current?.click()}
                        className="px-4 py-2 rounded-lg text-sm border border-white/10 text-gray-400 hover:text-white hover:border-violet-500/50 transition self-start"
                    >
                        Upload photo
                    </button>
                    {value && (
                        <p className="text-xs text-gray-500 truncate max-w-48">{value.name}</p>
                    )}
                </div>
                <input
                    type="file"
                    ref={useRef}
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    )
}
