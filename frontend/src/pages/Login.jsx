import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';

export default function Login() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMsg } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [sucessMsg, setSucessMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('All fields are required!!'));
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
       dispatch(signInFailure(data.message));
      }
      if(res.ok){
        setSucessMsg(data.message);
        dispatch(signInSuccess(data));
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  }

  return (
    <div className='min-h-screen pt-20 bg-customDark'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        <div className='flex-1'>
          <p className='text-gray-300 mb-3'>Connect with anyone, anywhere—instantly! Sign up to start seamless, high-quality video calls 🎥 with friends, family, and colleagues😊🚀.</p>
          <span className=' text-4xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text'>
            {" "}
            Virtuemeet
          </span>
          <p className="text-sm text-gray-300 mt-4">
            Don't have an account?{' '}
            <a href="/signup" className="text-orange-600 hover:underline">
              Sign up
            </a>
          </p>
          <p className="text-sm mt-4">
            <a href="/" className="text-orange-600 hover:underline">
              Skip{'>>'}
            </a>
          </p>
        </div>
        <div className='flex-1 '>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Enter email' className='text-stone-200' />
              <TextInput
                type='email'
                placeholder='example@gmail.com'
                id='email'
                autoComplete="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Enter password' className='text-stone-200' />
              <TextInput
                type='password'
                placeholder='******'
                id='password'
                autoComplete="current-password"
                onChange={handleChange}
              />
            </div>
            <Button className='btn-gradient focus:outline-none focus:ring-0' type='submit' disabled={loading}>
              {
                loading ? (
                  <>
                    <Spinner size='sm' />
                    <span>Loading...</span>
                  </>
                ) : 'Login'
              }
            </Button>
          </form>
          {
            errorMsg && (
              <Alert className='mt-5 bg-0 p-0' color='failure' >
                {errorMsg}
              </Alert>
            )
          }
          {
            sucessMsg && (
              <Alert className='mt-5 bg-0 p-0' color='success' >
                {sucessMsg}
              </Alert>
            )
          }
        </div>
      </div>
    </div>
  )
}
