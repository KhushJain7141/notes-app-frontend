import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "../components/Spinner";
import axios from "axios";

const BASE_URL = "http://localhost:4000";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

function UserRegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkPasswordMatch = () => {
    return formData.password === formData.confirmPassword;
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!checkPasswordMatch()) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(`${BASE_URL}/api/users/register`, {
        email: formData.email,
        password: formData.password,
      });

      toast.success("Registered successfully");
      if (result.data.token) {
        localStorage.setItem("token", result.data.token);
        navigate("/note");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-60px)] bg-ternary">
      <div className="w-[450px] bg-white px-10 py-8 flex flex-col gap-4 rounded-2xl shadow-sm">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center border-b border-line pb-4">
          Sign Up
        </h1>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="pl-1 text-sm font-medium text-secondary">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={handleInputChange}
            className="border rounded py-2 px-3 border-line bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col relative">
          <label htmlFor="password" className="pl-1 text-sm font-medium text-secondary">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleInputChange}
            className="border rounded py-2 px-3 border-line bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div
            className="absolute right-4 bottom-2 text-primary cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col relative">
          <label htmlFor="confirmPassword" className="pl-1 text-sm font-medium text-secondary">
            Confirm Password
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Re-enter your password"
            onChange={handleInputChange}
            className="border rounded py-2 px-3 border-line bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div
            className="absolute right-4 bottom-2 text-primary cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-2 h-12 bg-primary text-white rounded-full font-medium hover:opacity-90 transition"
        >
          {loading ? <Spinner /> : "Sign Up"}
        </button>

        {/* Footer */}
        <p className="text-center text-sm mt-2 text-secondary">
          Already have an account?{" "}
          <Link to="/" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default UserRegistrationPage;
