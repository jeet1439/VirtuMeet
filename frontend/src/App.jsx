import { Route, BrowserRouter as  Router, Routes } from 'react-router-dom';
import { lazy } from 'react';
import LandingPage from './pages/LandingPage';
import VideoMeetComponent from './pages/VideoMeet.jsx';


const Login = lazy(() => import('./pages/Login.jsx'));
const SignUp = lazy(() => import('./pages/SignUp.jsx'));
const SetMeeting = lazy(() => import('./pages/SetMeeting.jsx'));
const History = lazy(() => import('./pages/History.jsx'));

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<SetMeeting/>} />
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<SignUp/>}/>
          <Route path='/:url' element={<VideoMeetComponent/>}/>
          <Route path='/create-meet' element={<LandingPage/>}/>
          <Route path='/show_meeting_history' element={<History/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App;
