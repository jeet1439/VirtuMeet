import { Route, BrowserRouter as  Router, Routes } from 'react-router-dom';
import { lazy } from 'react';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import VideoMeetComponent from './pages/VideoMeet.jsx';

const Login = lazy(() => import('./pages/Login.jsx'));
const SignUp = lazy(() => import('./pages/SignUp.jsx'));

function App() {
  return (
    <>
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element={<LandingPage/>} />
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<SignUp/>}/>
          <Route path='/:url' element={<VideoMeetComponent/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App;
