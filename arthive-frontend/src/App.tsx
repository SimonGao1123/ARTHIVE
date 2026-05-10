import {  Route, Routes } from 'react-router-dom'
import NotFoundPage from './pages/NotFound'
import {useState} from 'react'
import ExplorePage from './pages/Explore'
import type { User, WhoamiResponse } from './types/user_types'

import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

import './App.css'
import {useLocation} from 'react-router-dom'
import {useLazyQuery} from '@apollo/client/react'
import { WHOAMI_QUERY } from './types/mutations/user_login_mutations'
import { whoAmIQuery } from './data/whoami'
import AdminPage from './pages/Admin'
import UploadMedia from './pages/admin_sub_pages/UploadMedia'
import MediaInfoPage from './pages/MediaInfoPage'
import AllUserReviewsPage from './pages/AllUserReviewsPage'
import ExplorePageNavBar from './lib/ExplorePageNavBar'
import ReviewPage from './pages/ReviewPage'
import UserProfilePage from './pages/UserProfilePage'
import UserFollowDetails from './pages/UserFollowDetails'
import EditUserProfile from './pages/EditUserProfile'
import AllUserListsPage from './pages/AllUserListsPage'
import ListPage from './pages/ListPage'
import CreateListPage from './pages/CreateListPage'
function App() {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()


  const [whoami] = useLazyQuery<WhoamiResponse>(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  })
  console.log("LOCAL STORAGE TOKEN", localStorage.getItem("authToken"))
  console.log(user)
  useEffect(() => {
    // If the user is on the login or register page, dont need to check who they are
    if (location.pathname === "/login" || location.pathname === "/register") {
      setUser(null)
      return
    }
    whoAmIQuery(whoami, navigate, setUser)

  }, [location.pathname])

  return (
    <>
      <Routes>
        <Route element={<ExplorePageNavBar user={user}/>}>
          {

            user && user.ifAdmin ? 
            <Route path="/admin/*" element={<AdminPage user={user} setUser={setUser}/>}>
              <Route path="upload_media" element={<UploadMedia user={user} setUser={setUser} />} />
            </Route>
            :
            <></> // no admin page for non-admin users
          }

          <Route path="/" element={<ExplorePage setUser={setUser} user={user}/>} />
          <Route path="/:user_id/all_reviews" element={<AllUserReviewsPage setUser={setUser}/>} />
          <Route path="/:user_id/all_lists" element={<AllUserListsPage setUser={setUser}/>} />

          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/media/:id" element={<MediaInfoPage user={user} setUser={setUser}/>} />
          <Route path="/review_info/:review_id" element={<ReviewPage setUser={setUser}/>} />
          <Route path="/profile/:id" element={<UserProfilePage setUser={setUser} user={user}/>} />
          <Route path="/profile/:follow_type/:id" element={<UserFollowDetails setUser={setUser} user={user}/>} />

          <Route path={`/edit_profile/${user?.id}`} element={<EditUserProfile setUser={setUser} user={user}/>} />

          <Route path="/list/:list_id" element={<ListPage setUser={setUser}/>} />

          <Route path="/create_list" element={<CreateListPage setUser={setUser}/>} />
        </Route>

        
        <Route path="/login" element={<LoginPage setUser={setUser}/>} />
        
      </Routes>
    </>
  )
}

export default App
