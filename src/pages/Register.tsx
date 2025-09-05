import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "../components/Spinner";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function UserRegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


  const isValidPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (score === 3 || score === 4)
      return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    if (score === 5) return { label: "Strong", color: "bg-green-500", width: "w-full" };

    return { label: "", color: "", width: "" };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on typing
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isValidPassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 chars, include uppercase, lowercase, number & special char";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
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
      
      let errorMessage = "Registration failed. User with this email may already exist.";
      if (e.response?.status === 400) {
        errorMessage = "User with this email already exists";
      }

      toast.error(errorMessage);
      setErrors({ email: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
            className={`border rounded py-2 px-3 bg-white focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-line focus:ring-primary"
            }`}
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1">{errors.email}</span>
          )}
        </div>

{/* Password */}
<div className="flex flex-col">
  <label
    htmlFor="password"
    className="pl-1 text-sm font-medium text-secondary"
  >
    Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      placeholder="Enter your password"
      onChange={handleInputChange}
      className={`w-full border rounded py-2 px-3 bg-white focus:outline-none focus:ring-2 ${
        errors.password
          ? "border-red-500 focus:ring-red-500"
          : "border-line focus:ring-primary"
      }`}
    />
    <div
      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary cursor-pointer"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff /> : <Eye />}
    </div>
  </div>

  {errors.password && (
    <span className="text-red-500 text-sm mt-1">{errors.password}</span>
  )}

  {formData.password && (
    <div className="mt-2">
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${passwordStrength.color} ${passwordStrength.width}`}
        ></div>
      </div>
      <p className="text-xs mt-1 text-secondary">{passwordStrength.label}</p>
    </div>
  )}
</div>

    {/* Confirm Password */}
<div className="flex flex-col">
  <label
    htmlFor="confirmPassword"
    className="pl-1 text-sm font-medium text-secondary"
  >
    Confirm Password
  </label>

  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      name="confirmPassword"
      value={formData.confirmPassword}
      placeholder="Re-enter your password"
      onChange={handleInputChange}
      className={`w-full border rounded py-2 px-3 bg-white focus:outline-none focus:ring-2 ${
        errors.confirmPassword
          ? "border-red-500 focus:ring-red-500"
          : "border-line focus:ring-primary"
      }`}
    />
    <div
      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary cursor-pointer"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      {showConfirmPassword ? <EyeOff /> : <Eye />}
    </div>
  </div>

  {errors.confirmPassword && (
    <span className="text-red-500 text-sm mt-1">{errors.confirmPassword}</span>
  )}
</div>


        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-2 h-12 bg-primary text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
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
