import { useState } from "react";

function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call - replace with your actual axios implementation
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.reload();
    } catch (error) {
      setErrors({
        submit: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-bold text-slate-900">
                  TeamFlow
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Already have an account?
              </span>
              <button
                onClick={onSwitchToLogin}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="min-h-screen flex">
        {/* Left Side - Registration Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Create your account
              </h2>
              <p className="mt-2 text-slate-600">
                Join thousands of teams already using TeamFlow
              </p>
            </div>

            {/* Registration Form Container */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              {/* Error Message */}
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">
                        {errors.submit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative group">
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      className={`w-full px-4 py-3 pr-12 bg-slate-50 border ${
                        errors.name ? "border-red-300" : "border-slate-200"
                      } rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200`}
                      placeholder="Enter your full name"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <svg
                        className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      className={`w-full px-4 py-3 pr-12 bg-slate-50 border ${
                        errors.email ? "border-red-300" : "border-slate-200"
                      } rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200`}
                      placeholder="Enter your email address"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <svg
                        className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      className={`w-full px-4 py-3 pr-12 bg-slate-50 border ${
                        errors.password ? "border-red-300" : "border-slate-200"
                      } rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200`}
                      placeholder="Create a secure password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.636 6.636m4.242 4.242L15.121 15.121m3.243-3.243l2.122-2.122M15.121 15.121l2.122 2.122"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Your Role
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      value={formData.role}
                      onChange={handleInputChange("role")}
                      className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none"
                    >
                      <option value="member">Team Member</option>
                      <option value="manager">Project Manager</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Create Account</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  By creating an account, you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-6">
              <div className="text-center">
                <span className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Enterprise Security
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Free to Start
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  No Setup Fees
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Brand Showcase */}
        <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-12 text-white">
            <div className="max-w-md">
              <h3 className="text-4xl font-bold mb-6 leading-tight">
                Join the future of team collaboration
              </h3>

              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Get started with TeamFlow today and experience seamless project
                management, real-time collaboration, and powerful analytics.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-4 mb-12">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-blue-100">
                    Start free - no credit card required
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-blue-100">
                    Setup your team in under 5 minutes
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-blue-100">
                    24/7 customer support included
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">14-day</div>
                  <div className="text-sm text-blue-200">Free Trial</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-sm text-blue-200">Teams Trust Us</div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-10 blur-2xl"></div>
            <div className="absolute bottom-32 left-16 w-24 h-24 bg-indigo-400 rounded-full opacity-10 blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-sm text-slate-600">
                © 2024 TeamFlow. Start your free trial today.
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default RegisterForm;
