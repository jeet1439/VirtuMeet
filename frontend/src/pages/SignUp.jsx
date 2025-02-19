import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [ formData, setFormData ] = useState({});
  const [ loading, setLoading ] = useState(false);
  const [ errorMsg, setErrorMsg ] = useState(null);
  const [ sucessMsg, setSucessMsg ] = useState(null);
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");


 
  const handleChange = (e) => {
    setFormData({...formData, [e.target.id] : e.target.value.trim()});
  };

  const handleSubmit = async (e) =>{
    e.preventDefault();
    if(!formData.username || !formData.email || !formData.password){
      return setErrorMsg('All fields are required!');
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/v1/users/register',{
       method: 'POST',
       headers: { 'Content-Type': 'application/json'},
       body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(!res.ok){
        setErrorMsg(data.message);
      }else{
        setOtpSent(true);
      }
      setLoading(false);
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      setSucessMsg(null);
      setLoading(true);
      const res = await fetch("/api/v1/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message);
      } else {
        setSucessMsg('Account verified successfully!');
        setTimeout(() => navigate('/login'), 2000); 
      }
      setLoading(false);
    } catch (error) {
      setSucessMsg(null);
      setErrorMsg(error.message);
      setLoading(false);
    }
  };
  
  

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
          Already have an account?{' '}
          <a href="/login" className="text-orange-600 hover:underline">
            Log in
          </a>
        </p>
        <p className="text-sm mt-4">
          <a href="/" className="text-orange-600 hover:underline">
            Skip{'>>'}
          </a>
        </p>
        </div>
        <div className='flex-1 '>
          {
            !otpSent ? (
              <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              <div>
                <Label value='Enter username' className='text-stone-200'/>
                <TextInput
                type='text'
                placeholder='Username'
                id='username'
                autoComplete="username"
                onChange={handleChange}
                />
                </div>
                <div>
                <Label value='Enter email' className='text-stone-200'/>
                <TextInput
                type='email'
                placeholder='example@gmail.com'
                id='email'
                autoComplete="email"
                onChange={handleChange}
                />
                </div>
                <div>
                <Label value='Enter password'className='text-stone-200'/>
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
                <Spinner size='sm'/>
                <span>Loading...</span>
                </>
              ) : 'Sign up'
            }
            </Button>
            </form>
            ) : (
              <>
              <form className="flex flex-col gap-4" onSubmit={handleOTPSubmit}>
              <p className='text-stone-500'>There is no free SMTP servise , use <span className='text-stone-200'>3451</span> to verify</p>
              <Label value="Enter OTP" className='text-stone-200'/>
              <TextInput type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <Button type="submit" disabled={loading} className='btn-gradient focus:outline-none focus:ring-0'>
                {loading ? <Spinner size="sm" /> : "Verify OTP"}
              </Button>
            </form>
            </>
            )
          } 
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
