import { useState } from "react";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate API call - replace with your actual axios implementation
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login successful:", data);

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Reload page to show dashboard
      window.location.reload();
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">
              Sign in to continue to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-3"
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
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="Enter your email address"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors"
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
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
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
                  Signing you in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign In</span>
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

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
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
              Protected by 256-bit SSL encryption
            </div>
          </div>
        </div>

        {/* Additional Elements for Visual Appeal */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            New to our platform?
            <span className="text-violet-600 hover:text-violet-700 font-semibold cursor-pointer ml-1 transition-colors">
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

// // import { useState } from "react";
// // import axios from "axios";

// // function LoginForm() {
// //   const [formData, setFormData] = useState({
// //     email: "",
// //     password: "",
// //   });
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [fieldErrors, setFieldErrors] = useState({});

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData({
// //       ...formData,
// //       [name]: value,
// //     });

// //     // Clear field error when user starts typing
// //     if (fieldErrors[name]) {
// //       setFieldErrors({ ...fieldErrors, [name]: "" });
// //     }

// //     // Clear general error
// //     if (error) setError("");
// //   };

// //   const validateForm = () => {
// //     const errors = {};

// //     if (!formData.email.trim()) {
// //       errors.email = "Email is required";
// //     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
// //       errors.email = "Please enter a valid email";
// //     }

// //     if (!formData.password) {
// //       errors.password = "Password is required";
// //     }

// //     setFieldErrors(errors);
// //     return Object.keys(errors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!validateForm()) return;

// //     setLoading(true);
// //     setError("");

// //     try {
// //       const response = await axios.post(
// //         "http://localhost:3001/api/auth/login",
// //         formData
// //       );

// //       console.log("Login successful:", response.data);

// //       // Store token in localStorage
// //       localStorage.setItem("token", response.data.token);
// //       localStorage.setItem("user", JSON.stringify(response.data.user));

// //       // Reload page to show dashboard
// //       window.location.reload();
// //     } catch (error) {
// //       setError(
// //         error.response?.data?.message || "Login failed. Please try again."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <>
// //       {/* Error Message */}
// //       {error && (
// //         <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
// //           <div className="flex items-center">
// //             <svg
// //               className="h-5 w-5 text-red-300 mr-3"
// //               fill="none"
// //               viewBox="0 0 24 24"
// //               stroke="currentColor"
// //             >
// //               <path
// //                 strokeLinecap="round"
// //                 strokeLinejoin="round"
// //                 strokeWidth={2}
// //                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// //               />
// //             </svg>
// //             <p className="text-red-200 text-sm">{error}</p>
// //           </div>
// //         </div>
// //       )}

// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         {/* Email Input */}
// //         <div>
// //           <label
// //             htmlFor="email"
// //             className="block text-sm font-medium text-white/90 mb-2"
// //           >
// //             Email Address
// //           </label>
// //           <div className="relative">
// //             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
// //               <svg
// //                 className="h-5 w-5 text-white/60"
// //                 fill="none"
// //                 viewBox="0 0 24 24"
// //                 stroke="currentColor"
// //               >
// //                 <path
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                   strokeWidth={2}
// //                   d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
// //                 />
// //               </svg>
// //             </div>
// //             <input
// //               id="email"
// //               type="email"
// //               name="email"
// //               value={formData.email}
// //               onChange={handleChange}
// //               className={`block w-full pl-12 pr-4 py-3 bg-white/10 border ${
// //                 fieldErrors.email ? "border-red-400" : "border-white/30"
// //               } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200`}
// //               placeholder="Enter your email address"
// //               required
// //             />
// //           </div>
// //           {fieldErrors.email && (
// //             <p className="mt-2 text-sm text-red-300 flex items-center">
// //               <svg
// //                 className="h-4 w-4 mr-1"
// //                 fill="none"
// //                 viewBox="0 0 24 24"
// //                 stroke="currentColor"
// //               >
// //                 <path
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                   strokeWidth={2}
// //                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// //                 />
// //               </svg>
// //               {fieldErrors.email}
// //             </p>
// //           )}
// //         </div>

// //         {/* Password Input */}
// //         <div>
// //           <label
// //             htmlFor="password"
// //             className="block text-sm font-medium text-white/90 mb-2"
// //           >
// //             Password
// //           </label>
// //           <div className="relative">
// //             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
// //               <svg
// //                 className="h-5 w-5 text-white/60"
// //                 fill="none"
// //                 viewBox="0 0 24 24"
// //                 stroke="currentColor"
// //               >
// //                 <path
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                   strokeWidth={2}
// //                   d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
// //                 />
// //               </svg>
// //             </div>
// //             <input
// //               id="password"
// //               type={showPassword ? "text" : "password"}
// //               name="password"
// //               value={formData.password}
// //               onChange={handleChange}
// //               className={`block w-full pl-12 pr-12 py-3 bg-white/10 border ${
// //                 fieldErrors.password ? "border-red-400" : "border-white/30"
// //               } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200`}
// //               placeholder="Enter your password"
// //               required
// //             />
// //             <button
// //               type="button"
// //               onClick={() => setShowPassword(!showPassword)}
// //               className="absolute inset-y-0 right-0 pr-4 flex items-center"
// //             >
// //               {showPassword ? (
// //                 <svg
// //                   className="h-5 w-5 text-white/60 hover:text-white/80"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                   stroke="currentColor"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.636 6.636m4.242 4.242L15.121 15.121m3.243-3.243l2.122-2.122M15.121 15.121l2.122 2.122"
// //                   />
// //                 </svg>
// //               ) : (
// //                 <svg
// //                   className="h-5 w-5 text-white/60 hover:text-white/80"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                   stroke="currentColor"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
// //                   />
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
// //                   />
// //                 </svg>
// //               )}
// //             </button>
// //           </div>
// //           {fieldErrors.password && (
// //             <p className="mt-2 text-sm text-red-300 flex items-center">
// //               <svg
// //                 className="h-4 w-4 mr-1"
// //                 fill="none"
// //                 viewBox="0 0 24 24"
// //                 stroke="currentColor"
// //               >
// //                 <path
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                   strokeWidth={2}
// //                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// //                 />
// //               </svg>
// //               {fieldErrors.password}
// //             </p>
// //           )}
// //         </div>

// //         {/* Remember Me & Forgot Password */}
// //         <div className="flex items-center justify-between">
// //           <label className="flex items-center">
// //             <input
// //               type="checkbox"
// //               className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
// //             />
// //             <span className="ml-2 text-sm text-white/80">Remember me</span>
// //           </label>
// //           <button
// //             type="button"
// //             className="text-sm text-purple-300 hover:text-purple-200 transition-colors duration-200"
// //           >
// //             Forgot password?
// //           </button>
// //         </div>

// //         {/* Submit Button */}
// //         <button
// //           type="submit"
// //           disabled={loading}
// //           className={`w-full flex justify-center items-center py-4 px-6 rounded-xl text-white font-medium transition-all duration-200 ${
// //             loading
// //               ? "bg-gray-500 cursor-not-allowed"
// //               : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 shadow-lg hover:shadow-xl"
// //           }`}
// //         >
// //           {loading ? (
// //             <>
// //               <svg
// //                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
// //                 fill="none"
// //                 viewBox="0 0 24 24"
// //               >
// //                 <circle
// //                   className="opacity-25"
// //                   cx="12"
// //                   cy="12"
// //                   r="10"
// //                   stroke="currentColor"
// //                   strokeWidth="4"
// //                 ></circle>
// //                 <path
// //                   className="opacity-75"
// //                   fill="currentColor"
// //                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
// //                 ></path>
// //               </svg>
// //               Signing In...
// //             </>
// //           ) : (
// //             <>
// //               <svg
// //                 className="h-5 w-5 mr-2"
// //                 fill="none"
// //                 viewBox="0 0 24 24"
// //                 stroke="currentColor"
// //               >
// //                 <path
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                   strokeWidth={2}
// //                   d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
// //                 />
// //               </svg>
// //               Sign In
// //             </>
// //           )}
// //         </button>
// //       </form>

// //       {/* Social Login Divider */}
// //       <div className="mt-8 mb-6">
// //         <div className="relative">
// //           <div className="absolute inset-0 flex items-center">
// //             <div className="w-full border-t border-white/20"></div>
// //           </div>
// //           <div className="relative flex justify-center text-sm">
// //             <span className="px-4 bg-white/5 text-white/60 rounded-full">
// //               Or continue with
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Social Login Buttons */}
// //       <div className="grid grid-cols-2 gap-3">
// //         <button className="flex items-center justify-center px-4 py-3 border border-white/30 rounded-xl text-white/80 bg-white/5 hover:bg-white/10 transition-all duration-200">
// //           <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
// //             <path
// //               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
// //               fill="#4285F4"
// //             />
// //             <path
// //               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
// //               fill="#34A853"
// //             />
// //             <path
// //               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
// //               fill="#FBBC05"
// //             />
// //             <path
// //               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
// //               fill="#EA4335"
// //             />
// //           </svg>
// //           Google
// //         </button>
// //         <button className="flex items-center justify-center px-4 py-3 border border-white/30 rounded-xl text-white/80 bg-white/5 hover:bg-white/10 transition-all duration-200">
// //           <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
// //             <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
// //           </svg>
// //           Facebook
// //         </button>
// //       </div>
// //     </>
// //   );
// // }

// // export default LoginForm;

// import { useState } from "react";
// import axios from "axios";

// function LoginForm() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await axios.post(
//         "http://localhost:3001/api/auth/login",
//         formData
//       );

//       console.log("Login successful:", response.data);

//       // Store token in localStorage
//       localStorage.setItem("token", response.data.token);
//       localStorage.setItem("user", JSON.stringify(response.data.user));

//       // Reload page to show dashboard
//       window.location.reload();
//     } catch (error) {
//       setError(error.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Email
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <div className="mb-6">
//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Password
//           </label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default LoginForm;
