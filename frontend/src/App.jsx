import { useState, useEffect } from "react";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Team Collaboration App</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {showRegister ? "Join Our Team!" : "Welcome Back!"}
          </h2>
          <p className="text-lg text-gray-600">
            {showRegister
              ? "Create your account to start collaborating"
              : "Sign in to manage your projects and tasks"}
          </p>
        </div>

        {showRegister ? (
          <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <div>
            <LoginForm />
            <p className="text-center mt-4">
              New user?
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-600 ml-1 hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

// // import { useState, useEffect } from "react";
// // import LoginForm from "./components/auth/LoginForm";
// // import Dashboard from "./components/dashboard/Dashboard";

// // function App() {
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);

// //   useEffect(() => {
// //     // Check if user is logged in
// //     const token = localStorage.getItem("token");
// //     if (token) {
// //       setIsLoggedIn(true);
// //     }
// //   }, []);

// //   // Show dashboard if logged in
// //   if (isLoggedIn) {
// //     return <Dashboard />;
// //   }

// //   // Show login form if not logged in
// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <nav className="bg-blue-600 text-white p-4 shadow-lg">
// //         <div className="container mx-auto">
// //           <h1 className="text-2xl font-bold">Team Collaboration App</h1>
// //         </div>
// //       </nav>

// //       <main className="container mx-auto px-4 py-8">
// //         <div className="text-center mb-8">
// //           <h2 className="text-4xl font-bold text-gray-800 mb-4">
// //             Welcome Back!
// //           </h2>
// //           <p className="text-lg text-gray-600">
// //             Sign in to manage your projects and tasks
// //           </p>
// //         </div>
// //         <LoginForm />
// //       </main>
// //     </div>
// //   );
// // }

// // export default App;
