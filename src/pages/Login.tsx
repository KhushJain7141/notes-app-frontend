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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };

  const handleSubmit = async (): Promise<string | null> => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");

      setErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : "",
      });

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

    
      localStorage.setItem("token", token);

      toast.success("Logged in successfully");


      navigate("/note");

      return token;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          toast.error("Invalid email or password");
          setErrors({
            email: "Invalid email or password",
            password: "Invalid email or password",
          });
        } else if (status === 404) {
          toast.error("User does not exist");
          setErrors({
            email: "User not found",
          });
        } else {
          toast.error(error.response.data?.message || "Something went wrong");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
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
            className={`border p-3 rounded-lg focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-line focus:ring-primary"
            }`}
            onChange={handleInputChange}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            className={`border p-3 rounded-lg focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-line focus:ring-primary"
            }`}
            onChange={handleInputChange}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">{errors.password}</span>
          )}
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
