import { Route, BrowserRouter as  Router, Routes } from 'react-router-dom';
import { lazy } from 'react';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';

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
        </Routes>
      </Router>
    </>
  )
}

export default App;
