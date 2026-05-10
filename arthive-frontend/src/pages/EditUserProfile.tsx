import { useMutation } from "@apollo/client/react"
import type { User } from "../types/user_types"
import { EDIT_USER_PROFILE_MUTATION, type EditUserProfileInput, type EditUserProfileResponse } from "../types/mutations/edit_user_profile_mutation"
import { useRef, useState } from "react"
import { LOGIN_USER, type LoginInput, type LoginUserMutation} from "../types/mutations/user_login_mutations"
import { EditUserProfileDataFetch } from "../data/edit_user_profile"
import { useNavigate } from "react-router-dom"

type EditUserProfileProps = {
    setUser: (user: User | null) => void
    user: User | null
}

export default function EditUserProfile({ setUser, user }: EditUserProfileProps) {


    const [editUserProfile, { loading, error }] = useMutation<EditUserProfileResponse, EditUserProfileInput>(EDIT_USER_PROFILE_MUTATION)

    const [username, setUsername] = useState<string | null>(user?.username || null)
    const [description, setDescription] = useState<string | null>(user?.description || null)
    const [email, setEmail] = useState<string | null>(user?.email || null)
    const [visibility, setVisibility] = useState<string | null>(user?.visibility || null)
    
    const profilePictureRef = useRef<HTMLInputElement>(null)
    const [profilePicture, setProfilePicture] = useState<File | null>(null)

    const [password, setPassword] = useState<string | null>(null)
    const [ifChangingPassword, setIfChangingPassword] = useState<boolean>(false)
    const [ifViewPassword, setIfViewPassword] = useState<boolean>(false)
    

    console.log(
        "username", username,
        "description", description,
        "email", email,
        "visibility", visibility,
        "profilePicture", profilePicture,
        "password", password,
        "ifChangingPassword", ifChangingPassword,
        "ifViewPassword", ifViewPassword
    )
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
        <div>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            <h1>Edit User Profile {user?.username}</h1>

            <form onSubmit={(e) => {
                e.preventDefault()
                EditUserProfileDataFetch(setUser, navigate, username, description, email, visibility, profilePicture, password, editUserProfile)
                clearChanges()
            }}>
                <InputField label="Username" value={username} onChange={setUsername} type="text" />
                <InputField label="Description" value={description} onChange={setDescription} type="textarea" />
                <InputField label="Email" value={email} onChange={setEmail} type="text" />
                <InputField label="Visibility" value={visibility} onChange={setVisibility} type="switch" />
                <FileInput label="Profile Picture" value={profilePicture} onChange={setProfilePicture} useRef={profilePictureRef} defaultFile={user?.profilePicture || ""} />
                {user && ifChangingPassword ? <PasswordInput setIfChangingPassword={setIfChangingPassword} setPassword={setPassword} user={user} /> : <button onClick={() => setIfChangingPassword(true)}>Change Password</button>}
                
                {ifViewPassword ? 
                <>
                    <p>{password || "No password set"}</p>
                    <button onClick={() => setIfViewPassword(false)}>Hide Password</button>
                </> : <button onClick={() => setIfViewPassword(true)}>View Password</button>}
                
                <button type="submit">Save Changes</button>

                
            </form>

            <button onClick={() => {
                clearChanges()
                setIfChangingPassword(false)
            }}>Clear Changes</button>
        </div>
    )
}

function PasswordInput({setIfChangingPassword, setPassword, user}: {setIfChangingPassword: (value: boolean) => void, setPassword: (value: string | null) => void, user: User}) {
    const [currentPassword, setCurrentPassword] = useState<string | null>(null)
    const [confirmPassword, setConfirmPassword] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState<string | null>(null)
    const [loginUser, {error}] = useMutation<LoginUserMutation, LoginInput>(LOGIN_USER)

    console.log("currentPassword", currentPassword, "newPassword", newPassword, "confirmPassword", confirmPassword)


    return (
        <div>
            {error && <p>Error: {error.message}</p>}
            <InputField label="Current Password" value={currentPassword} onChange={setCurrentPassword} type="password" />
            <InputField label="New Password" value={newPassword} onChange={setNewPassword} type="password" />
            <InputField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
            <button type="button" onClick={() => {
                if (currentPassword === null || newPassword === null || confirmPassword === null) {
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
                loginUser({variables: {input: {email: user.email, password: currentPassword}}})
                .then((data) => {
                    console.log(data)
                    if (data.data?.login.user.id === user.id) {
                        setPassword(newPassword)
                        setNewPassword(null)
                        setConfirmPassword(null)
                        setCurrentPassword(null)
                    } else {
                        alert("Current password is incorrect")
                    }
                })
                .catch((error) => {
                    alert("Error: " + error.message)
                })
            }}>Save Password</button>
            <button onClick={() => {
                setIfChangingPassword(false)
                setCurrentPassword(null)
                setNewPassword(null)
                setConfirmPassword(null)
            }}>Cancel</button>
        </div>
    )
}


function InputField({label, value, onChange, type}: {label: string, value: string | null, onChange: (value: string | null) => void, type: string}) {

    let inputField = null;
    if (type === "textarea") {
        inputField = (<textarea value={value || ""} onChange={(e) => onChange(e.target.value !== "" ? e.target.value : null)} />)
    } else if (type === "text" || type === "email") {
        inputField = (<input type={type} value={value || ""} onChange={(e) => onChange(e.target.value !== "" ? e.target.value : null)} />)
    } else if (type === "switch") {
        inputField = (<button type="button" onClick={() => onChange(value==="public" ? "private" : "public")}>({value}) {value==="public" ? "Set Private" : "Set Public"}</button>)
    } else if (type === "password") {
        inputField = (<input type="password" value={value || ""} onChange={(e) => onChange(e.target.value !== "" ? e.target.value : null)} />)
    }
    return (
        <div>
            <label>{label}</label>
            {inputField}
        </div>
    )
}

function FileInput({label, value, onChange, useRef, defaultFile}: {label: string, value: File | null, onChange: (value: File | null) => void, useRef: React.RefObject<HTMLInputElement | null>, defaultFile: string}) {
    return (
        <div>
            <label>{label}</label>
            <input type="file" ref={useRef} onChange={(e) => onChange(e.target.files?.[0] || null)} accept="image/*" />
            <img width={300} height={300} src={value ? URL.createObjectURL(value) : (defaultFile ? defaultFile : "/default-ARTHIVE-pfp.png")} alt="Profile Picture" />
            <button type="button" onClick={() => {
                if (useRef.current) {
                    useRef.current.value = ""
                    if (value) {
                        URL.revokeObjectURL(URL.createObjectURL(value))
                    }
                    onChange(null)
                }
            }}>X</button>
        </div>
    )
}