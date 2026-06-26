import { Link } from "react-router-dom"

type Props = {
    title?: string
    message?: string
}

export default function SignInPrompt({ title = "Sign in to view this content", message = "This content is private. Sign in to your account to continue." }: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 bg-[#171519] rounded-2xl border border-white/5 p-10 text-center">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-400 max-w-md">{message}</p>
            <div className="flex gap-2">
                <Link
                    to="/login"
                    className="px-4 py-1.5 rounded-full text-sm bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 transition"
                >
                    Sign in
                </Link>
                <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-full text-sm border border-white/10 text-gray-300 hover:bg-white/5 transition"
                >
                    Create account
                </Link>
            </div>
        </div>
    )
}

type ModalProps = Props & {
    open: boolean
    onClose: () => void
}

export function SignInPromptModal({ open, onClose, title, message }: ModalProps) {
    if (!open) return null
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <SignInPrompt title={title} message={message} />
            </div>
        </div>
    )
}
