import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client/react'

import './App.css'
import type { User, WhoamiResponse } from '@/types/domain/user'
import { WHOAMI_QUERY } from '@/apollo/queries/user_queries'
import { whoAmIQuery } from '@/data/auth/whoami'

import AppShell from '@/shared/layout/AppShell'
import ScrollToTop from '@/shared/layout/ScrollToTop'
import NotFoundPage from '@/pages/NotFoundPage'
import ExplorePage from '@/pages/ExplorePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import AdminPage from '@/pages/AdminPage'
import UploadMedia from '@/features/admin/sub-pages/UploadMedia'
import MediaInfoPage from '@/pages/MediaInfoPage'
import AllUserReviewsPage from '@/pages/AllUserReviewsPage'
import ReviewPage from '@/pages/ReviewPage'
import UserProfilePage from '@/pages/UserProfilePage'
import UserFollowDetailsPage from '@/pages/UserFollowDetailsPage'
import EditUserProfilePage from '@/pages/EditUserProfilePage'
import AllUserListsPage from '@/pages/AllUserListsPage'
import ListPage from '@/pages/ListPage'
import CreateListPage from '@/pages/CreateListPage'
import CommunityPage from '@/pages/CommunityPage'
import ThreadPage from '@/pages/ThreadPage'
import SearchResultsPage from '@/pages/SearchResultsPage'
import MyLoggedMediaPage from '@/pages/MyLoggedMediaPage'
import MyLikesPage from '@/pages/MyLikesPage'
import NotificationsPage from '@/pages/NotificationsPage'

function App() {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const [whoami] = useLazyQuery<WhoamiResponse>(WHOAMI_QUERY, {
    fetchPolicy: "no-cache",
  })
  console.log("LOCAL STORAGE TOKEN", localStorage.getItem("authToken"))
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      setUser(null)
      return
    }
    whoAmIQuery(whoami, navigate, setUser)
  }, [location.pathname])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell user={user} setUser={setUser}/>}>
        {user && user.ifAdmin ? (
          <Route path="/admin/*" element={<AdminPage user={user} setUser={setUser}/>}>
            <Route path="upload_media" element={<UploadMedia user={user} setUser={setUser} />} />
          </Route>
        ) : null}

        <Route path="/" element={<ExplorePage setUser={setUser} user={user}/>} />
        <Route path="/all_reviews/:user_id" element={<AllUserReviewsPage setUser={setUser} user={user}/>} />
        <Route path="/all_lists/:user_id" element={<AllUserListsPage setUser={setUser} user={user}/>} />
        <Route path="/liked/:user_id" element={<MyLikesPage setUser={setUser} user={user}/>} />
        <Route path="/finished/:user_id" element={<MyLoggedMediaPage setUser={setUser} user={user}/>} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/media/:id" element={<MediaInfoPage user={user} setUser={setUser}/>} />
        <Route path="/review_info/:review_id" element={<ReviewPage setUser={setUser} user={user}/>} />
        <Route path="/profile/:id" element={<UserProfilePage setUser={setUser} user={user}/>} />
        <Route path="/profile/:follow_type/:id" element={<UserFollowDetailsPage setUser={setUser} user={user}/>} />
        <Route path="/edit_profile" element={<EditUserProfilePage setUser={setUser} user={user}/>} />
        <Route path="/list/:list_id" element={<ListPage user={user} setUser={setUser}/>} />
        <Route path="/create_list" element={<CreateListPage setUser={setUser} user={user}/>} />
        <Route path="/community/:media_id" element={<CommunityPage setUser={setUser} user={user}/>} />
        <Route path="/community/:media_id/thread/:thread_id" element={<ThreadPage setUser={setUser} user={user}/>} />
        <Route path="/search" element={<SearchResultsPage key={location.search} setUser={setUser}/>} />
        <Route path="/notifications" element={<NotificationsPage setUser={setUser} user={user}/>} />
      </Route>

        <Route path="/login" element={<LoginPage setUser={setUser}/>} />
        <Route path="/register" element={<RegisterPage/>}/>
      </Routes>
    </>
  )
}

export default App
