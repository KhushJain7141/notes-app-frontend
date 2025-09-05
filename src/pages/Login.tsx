import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "../components/Spinner";

const BASE_URL = import.meta.env.VITE_API_URL;

function UserEmailLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (): Promise<string | null> => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return null;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        email: formData.email,
        password: formData.password,
      });

   
      const token = response.data?.token;
      if (!token) {
        toast.error("No token received from server");
        return null;
      }

      // Save token to localStorage
      localStorage.setItem("token", token);

      toast.success("Logged in successfully");

      // Redirect
      navigate("/note");

      // Return token so it can be used if needed
      return token;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-60px)] w-full flex justify-center items-center">
      <div className="w-[450px] bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-5 text-secondary">
        {/* Header */}
        <h1 className="text-3xl font-bold border-b border-primary pb-3 mb-2">
          Login
        </h1>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter your email"
            className="border border-line p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={handleInputChange}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            className="border border-line p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={handleInputChange}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-primary text-white font-medium rounded-full py-3 w-full transition ${
            loading ? "cursor-not-allowed opacity-70" : "hover:opacity-90"
          }`}
        >
          {loading ? <Spinner /> : "Login"}
        </button>

        {/* Footer */}
        <p className="text-center text-md">
          New here?{" "}
          <Link to="/register" className="text-primary font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default UserEmailLoginPage;
