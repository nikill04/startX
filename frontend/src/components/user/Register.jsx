// Startup registration. Two steps:
//   1. create an account (username, email, password)  -- or sign in with Google
//   2. fill in the company details ("KYC")
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Cookies from 'js-cookie'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'
import api, { getErrorMessage } from '../../api'

const googleEnabled = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID)

const inputClass = "mt-1 block w-full px-4 py-3 bg-[#F5F5F5] border border-[#48CFCB] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#229799] focus:border-transparent text-[#424242] placeholder-[#424242]"
const buttonClass = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#229799] hover:bg-[#48CFCB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#48CFCB] transition-colors duration-200 disabled:opacity-60"

// The company detail fields shown in step 2: [field name, label, input type]
const kycFields = [
  ['company_name', 'Company Name', 'text'],
  ['address', 'Address', 'text'],
  ['contact_person_name', 'Contact Person Name', 'text'],
  ['contact_person_email', 'Contact Person Email', 'email'],
  ['contact_person_phone', 'Contact Person Phone', 'tel'],
  ['incorporation_date', 'Incorporation Date', 'date'],
  ['industry', 'Industry', 'text'],
  ['website', 'Website', 'url'],
]

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()

  // If we came here from the login page, the account already exists: go straight to step 2
  const [userId, setUserId] = useState(location.state?.userId || null)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [kycDetails, setKycDetails] = useState({
    company_name: '',
    address: '',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    incorporation_date: '',
    industry: '',
    website: '',
  })
  const [profilePic, setProfilePic] = useState(null)

  const showKYCForm = Boolean(userId)

  // Step 1: create the account
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/register', { username, password, email })
      Cookies.set('user', data.userId)
      setUserId(data.userId)
    } catch (error) {
      alert(getErrorMessage(error))
    }
    setIsLoading(false)
  }

  // Step 2: send the company details (and the optional picture) as a form
  const handleKYCSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(kycDetails).forEach(([key, value]) => formData.append(key, value))
    formData.append('user', userId)
    if (profilePic) formData.append('profile_pic', profilePic)

    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/kyc', formData)
      Cookies.set('user', userId)
      Cookies.set('startup', data.startup)
      navigate('/home')
    } catch (error) {
      alert(getErrorMessage(error))
    }
    setIsLoading(false)
  }

  // After Google sign in: existing users with company details go to the dashboard, others fill step 2
  const handleGoogleUser = (data) => {
    Cookies.set('user', data.userId)
    if (data.startup) {
      Cookies.set('startup', data.startup)
      navigate('/home')
    } else {
      setUserId(data.userId)
    }
  }

  // Background animation: little dots moving around on a <canvas>
  useEffect(() => {
    const canvas = document.getElementById('bgCanvas')
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1
      })
    }

    let animationFrameId
    function animate() {
      // Ask the browser to call animate() again before the next screen refresh (~60 times a second)
      animationFrameId = requestAnimationFrame(animate)
      ctx.clearRect(0, 0, canvas.width, canvas.height) // wipe the previous frame

      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        // Bounce off the edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath() // start a new circle (otherwise all circles get joined by lines)
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(72, 207, 203, 0.5)'
        ctx.fill()
      })
    }
    animate()

    // Stop the animation when we leave the page
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4 relative">
      <canvas id="bgCanvas" className="absolute top-0 left-0 w-full h-full" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div className="bg-[#229799] p-8 text-white">
            <h6 className="text-2xl font-bold text-center mb-2">
              {showKYCForm ? 'Tell Us About Your Startup' : 'Register Your Startup'}
            </h6>
          </div>
          <div className="p-8 space-y-6">
            {!showKYCForm ? (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-[#424242]">Username</label>
                    <input id="username" className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter your username" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-[#424242]">Email</label>
                    <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-[#424242]">Password</label>
                    <input id="password" type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} placeholder="Enter your password" />
                  </div>
                  <button className={buttonClass} type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </button>
                </form>

                {googleEnabled && <GoogleButton onSignedIn={handleGoogleUser} />}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <form onSubmit={handleKYCSubmit} className="space-y-4">
                  {kycFields.map(([key, label, type]) => (
                    <div key={key} className="space-y-1">
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700">{label}</label>
                      <input
                        id={key}
                        type={type}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={kycDetails[key]}
                        onChange={(e) => setKycDetails({ ...kycDetails, [key]: e.target.value })}
                        placeholder={type === 'url' ? 'https://...' : ''}
                        required
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label htmlFor="profile_pic" className="block text-sm font-medium text-[#424242]">Profile Picture (optional, max 1 MB)</label>
                    <input
                      id="profile_pic"
                      type="file"
                      accept="image/*"
                      className={inputClass}
                      onChange={(e) => setProfilePic(e.target.files[0])}
                    />
                  </div>
                  <button className={buttonClass} type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Details'}
                  </button>
                </form>
              </motion.div>
            )}

            <p className="text-center text-sm text-[#424242]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#229799] hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// "Sign in with Google" button. It is only shown when REACT_APP_GOOGLE_CLIENT_ID is set,
// because Google's login code crashes the page without a client id.
function GoogleButton({ onSignedIn }) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await api.get('/auth/google', { params: { access_token: tokenResponse.access_token } })
        onSignedIn(data)
      } catch (error) {
        alert(getErrorMessage(error))
      }
    },
    onError: () => alert('Google sign in failed. Please try again.'),
  })

  return (
    <>
      <div className="relative flex items-center justify-center mt-8">
        <span className="absolute inset-x-0 h-px bg-[#48CFCB]"></span>
        <span className="relative px-4 text-sm text-[#424242] bg-white">or</span>
      </div>
      <button
        type="button"
        onClick={() => googleLogin()}
        className="mt-4 flex items-center justify-center w-full py-3 px-4 border border-[#48CFCB] rounded-lg shadow-sm text-sm font-medium text-[#424242] bg-white hover:bg-[#F5F5F5] transition-colors duration-200"
      >
        <FcGoogle className="mr-2" /> Sign in with Google
      </button>
    </>
  )
}
