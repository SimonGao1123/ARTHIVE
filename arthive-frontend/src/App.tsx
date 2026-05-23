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
import CommunityPage from './pages/CommunityPage'
import ThreadPage from './pages/ThreadPage'
import SearchPageResults from './pages/SearchPageResults'
import UserLikedOrFinishedMediaPage from './pages/UserLikedOrFinishedMediaPage'
function App() {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()


  const [whoami] = useLazyQuery<WhoamiResponse>(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  })
  console.log("LOCAL STORAGE TOKEN", localStorage.getItem("authToken"))
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
          <Route path="/all_reviews/:user_id" element={<AllUserReviewsPage setUser={setUser}/>} />
          <Route path="/all_lists/:user_id" element={<AllUserListsPage setUser={setUser}/>} />
          <Route path="/liked/:user_id" element={<UserLikedOrFinishedMediaPage type="liked" setUser={setUser}/>} />
          <Route path="/finished/:user_id" element={<UserLikedOrFinishedMediaPage type="finished" setUser={setUser}/>} />

          <Route path="*" element={<NotFoundPage />} />
          <Route path="/media/:id" element={<MediaInfoPage user={user} setUser={setUser}/>} />
          <Route path="/review_info/:review_id" element={<ReviewPage setUser={setUser}/>} />
          <Route path="/profile/:id" element={<UserProfilePage setUser={setUser} user={user}/>} />
          <Route path="/profile/:follow_type/:id" element={<UserFollowDetails setUser={setUser} user={user}/>} />

          <Route path={`/edit_profile`} element={<EditUserProfile setUser={setUser} user={user}/>} />

          <Route path="/list/:list_id" element={<ListPage setUser={setUser}/>} />

          <Route path="/create_list" element={<CreateListPage setUser={setUser} user={user}/>} />
          <Route path="/community/:media_id" element={<CommunityPage setUser={setUser}/>} />
          <Route path="/community/:media_id/thread/:thread_id" element={<ThreadPage setUser={setUser}/>} />

          <Route path="/search" element={<SearchPageResults key={location.search} setUser={setUser}/>} />
        </Route>

        
        <Route path="/login" element={<LoginPage setUser={setUser}/>} />
        <Route path="/register" element={<RegisterPage/>}/>
        
      </Routes>
    </>
  )
}

export default App
