import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import GoogleLoginButton from "../../components/GoogleLoginButton";

const LoginNGO = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // capture response
      const { data } = await api.post("/auth/login-ngo", { email, password });

      // Save user + token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("NGO login successful!");
      navigate("/ngo-dashboard");
    } catch (error) {
      console.error(error.response?.data); // helpful debug
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-4 sm:mb-6">NGO Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Login */}
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-600 mb-3">
            Login with Google
          </p>
          <GoogleLoginButton role="ngo" isRegister={false} />
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register-ngo')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginNGO;
