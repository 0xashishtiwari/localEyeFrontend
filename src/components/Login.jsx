import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosClient } from "../utils/AxiosClient";
import { KEY_ACCESS_TOKEN, setitem } from "../utils/LocalStorageManager";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const result = await AxiosClient.post("/auth/login", { email, password });
      setitem(KEY_ACCESS_TOKEN, result.accesstoken);
      setitem("user_email", email);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-screen h-screen bg-[url('/bghome.jpg')] bg-cover bg-center flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-[90%] max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-auto" />
          <h2 className="text-3xl font-semibold text-gray-800">Login</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Button */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="submit"
              className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition duration-200"
            >
              Login
            </button>
            <p className="text-sm text-gray-600">
              New user?{" "}
              <Link to="/signup" className="text-green-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
