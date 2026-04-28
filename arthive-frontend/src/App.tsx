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
import { logout } from './data/logout'
import AdminPage from './pages/Admin'
import UploadMedia from './pages/admin_sub_pages/UploadMedia'
import MediaInfoPage from './pages/MediaInfoPage'
import AllUserReviewsPage from './pages/AllUserReviewsPage'
import ExplorePageNavBar from './lib/ExplorePageNavBar'
import ReviewPage from './pages/ReviewPage'
import UserProfilePage from './pages/UserProfilePage'

function App() {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()


  const [whoami] = useLazyQuery<WhoamiResponse>(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  })
  console.log(localStorage.getItem("authToken"))
  useEffect(() => {
    // If the user is on the login or register page, dont need to check who they are
    if (location.pathname === "/login" || location.pathname === "/register") {
      setUser(null)
      return
    }
    whoAmIQuery(whoami, navigate, setUser)
    .then((user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })
    .catch((error) => {
      console.log("error in useEffect", error)
      logout(setUser, navigate)
    })

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
          <Route path="/all_reviews" element={<AllUserReviewsPage setUser={setUser}/>} />
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/media/:prev_page/:id" element={<MediaInfoPage user={user} setUser={setUser}/>} />
          <Route path="/:prev_page/review_info/:id" element={<ReviewPage setUser={setUser}/>} />
          <Route path="/profile/:id" element={<UserProfilePage setUser={setUser} user={user}/>} />
        </Route>

        
        <Route path="/login" element={<LoginPage setUser={setUser}/>} />
        
      </Routes>
    </>
  )
}

export default App
