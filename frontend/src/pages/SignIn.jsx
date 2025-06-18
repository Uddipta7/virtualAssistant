import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye, IoEyeOff } from "react-icons/io5"
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext'
import axios from "axios"

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const { serverUrl, userData, setUserData } = useContext(userDataContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email, password
      }, { withCredentials: true })

      setUserData(result.data)
      setLoading(false)
      navigate("/")
    } catch (error) {
      console.log(error)
      setUserData(null)
      setLoading(false)
      setErr(error.response?.data?.message || "Sign-in failed")
    }
  }

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[400px] bg-[#00000050] backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] px-8 py-10 flex flex-col justify-center text-white"
        onSubmit={handleSignIn}
      >
        <h2 className="text-2xl font-semibold mb-8 text-center">
          Sign In to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Virtual Assistant
          </span>
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-full bg-transparent border border-white placeholder-white focus:outline-none"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 pr-10 rounded-full bg-transparent border border-white placeholder-white focus:outline-none"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {showPassword ? (
            <IoEyeOff
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <IoEye
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {err.length > 0 && (
          <p className="text-red-400 text-center text-[17px] mt-[-10px] mb-[10px]">
            *{err}
          </p>
        )}

        <div className="flex justify-center">
          <button
            className="w-[120px] h-[50px] bg-white text-black font-semibold rounded-full text-[17px] hover:bg-gray-200 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </div>

        <p className="text-sm text-center text-[17px] mt-6">
          Want to create a new account?{' '}
          <span
            className="text-blue-400 hover:underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  )
}

export default SignIn
