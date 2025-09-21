import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState("login"); // login, privacy, terms, support

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // If logged in, show dashboard with full-screen portal
  if (isLoggedIn) {
    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          overflow: "hidden",
        }}
      >
        <Dashboard />
      </div>,
      document.body
    );
  }

  // If showing register, create a portal for full-screen
  if (showRegister) {
    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
        }}
      >
        <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
      </div>,
      document.body
    );
  }

  // Privacy Policy Page
  if (currentPage === "privacy") {
    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div className="min-h-screen bg-slate-50">
          {/* Header Navigation */}
          <nav className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div
                    onClick={() => setCurrentPage("login")}
                    className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
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
                <span
                  onClick={() => setCurrentPage("login")}
                  className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Back to Login
                </span>
              </div>
            </div>
          </nav>

          {/* Privacy Policy Content */}
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">
              Privacy Policy
            </h1>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="prose max-w-none">
                <p className="text-slate-600 mb-6">
                  Last updated: September 2025
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Information We Collect
                </h2>
                <p className="text-slate-700 mb-6">
                  We collect information you provide directly to us, such as
                  when you create an account, use our services, or contact us
                  for support. This may include your name, email address, and
                  any content you create or share through our platform.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-slate-700 mb-6">
                  We use the information we collect to provide, maintain, and
                  improve our services, process transactions, send you technical
                  notices and support messages, and respond to your comments and
                  questions.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Information Sharing
                </h2>
                <p className="text-slate-700 mb-6">
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information only in specific
                  circumstances, such as with your consent or to comply with
                  legal obligations.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Data Security
                </h2>
                <p className="text-slate-700 mb-6">
                  We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-slate-700">
                  If you have any questions about this Privacy Policy, please
                  contact us through our support page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Terms of Service Page
  if (currentPage === "terms") {
    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div className="min-h-screen bg-slate-50">
          {/* Header Navigation */}
          <nav className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div
                    onClick={() => setCurrentPage("login")}
                    className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
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
                <span
                  onClick={() => setCurrentPage("login")}
                  className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Back to Login
                </span>
              </div>
            </div>
          </nav>

          {/* Terms of Service Content */}
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">
              Terms of Service
            </h1>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="prose max-w-none">
                <p className="text-slate-600 mb-6">
                  Last updated: September 2025
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-slate-700 mb-6">
                  By accessing and using TeamFlow, you accept and agree to be
                  bound by the terms and provision of this agreement. If you do
                  not agree to abide by the above, please do not use this
                  service.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Use License
                </h2>
                <p className="text-slate-700 mb-6">
                  Permission is granted to temporarily use TeamFlow for personal
                  and commercial purposes. This is the grant of a license, not a
                  transfer of title, and under this license you may not modify
                  or distribute the materials for any purpose.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  User Account
                </h2>
                <p className="text-slate-700 mb-6">
                  You are responsible for safeguarding your account and all
                  activities that occur under your account. You must notify us
                  immediately upon becoming aware of any breach of security or
                  unauthorized use of your account.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Prohibited Uses
                </h2>
                <p className="text-slate-700 mb-6">
                  You may not use our service for any illegal or unauthorized
                  purpose, violate any laws in your jurisdiction, transmit any
                  viruses or malicious code, or attempt to gain unauthorized
                  access to our systems.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-slate-700 mb-6">
                  TeamFlow shall not be liable for any damages arising out of or
                  in connection with your use of our service. This is a
                  comprehensive limitation of liability that applies to all
                  damages of any kind.
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-slate-700">
                  If you have any questions about these Terms of Service, please
                  contact us through our support page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Support Page
  if (currentPage === "support") {
    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div className="min-h-screen bg-slate-50">
          {/* Header Navigation */}
          <nav className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div
                    onClick={() => setCurrentPage("login")}
                    className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
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
                <span
                  onClick={() => setCurrentPage("login")}
                  className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Back to Login
                </span>
              </div>
            </div>
          </nav>

          {/* Support Content */}
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Support</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 mb-1">
                        Email Support
                      </h3>
                      <p className="text-slate-600 text-sm mb-2">
                        Get help via email
                      </p>
                      <a
                        href="mailto:jsaivaishnavi15@gmail.com"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        jsaivaishnavi15@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 mb-1">
                        Phone Support
                      </h3>
                      <p className="text-slate-600 text-sm mb-2">
                        Call us for immediate assistance
                      </p>
                      <a
                        href="tel:+917731871112"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        +91 77318 71112
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-purple-600"
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
                    <div>
                      <h3 className="font-medium text-slate-900 mb-1">
                        Support Manager
                      </h3>
                      <p className="text-slate-600 text-sm mb-2">
                        Your dedicated support contact
                      </p>
                      <p className="text-purple-600 font-medium">
                        J Sai Vaishnavi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Hours & FAQ */}
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    Support Hours
                  </h2>
                  <div className="space-y-2 text-slate-700">
                    <p>
                      <span className="font-medium">Monday - Friday:</span> 9:00
                      AM - 6:00 PM IST
                    </p>
                    <p>
                      <span className="font-medium">Saturday:</span> 10:00 AM -
                      4:00 PM IST
                    </p>
                    <p>
                      <span className="font-medium">Sunday:</span> Closed
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Emergency support available 24/7 for critical issues
                      affecting your team's productivity.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    Quick Help
                  </h2>
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-medium text-slate-900 mb-1">
                        Account Issues
                      </h4>
                      <p className="text-sm text-slate-600">
                        Having trouble logging in or accessing your account?
                      </p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-medium text-slate-900 mb-1">
                        Project Management
                      </h4>
                      <p className="text-sm text-slate-600">
                        Need help creating or managing your projects?
                      </p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-medium text-slate-900 mb-1">
                        Team Collaboration
                      </h4>
                      <p className="text-sm text-slate-600">
                        Questions about adding members or sharing projects?
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">
                        Technical Issues
                      </h4>
                      <p className="text-sm text-slate-600">
                        Experiencing bugs or performance problems?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Professional Login Landing Page
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
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
                <span className="text-sm text-slate-600">New to TeamFlow?</span>
                <button
                  onClick={() => setShowRegister(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="min-h-screen flex">
          {/* Left Side - Login Form */}
          <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  Welcome back
                </h2>
                <p className="mt-2 text-slate-600">
                  Sign in to your TeamFlow account
                </p>
              </div>

              {/* Login Form Container */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <LoginForm />
              </div>

              {/* Additional Options */}
              <div className="mt-6">
                <div className="text-center">
                  <span className="text-sm text-slate-600">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setShowRegister(true)}
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      Sign up for free
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    99.9% Uptime
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
                    SOC 2 Compliant
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
                  Streamline your team's productivity
                </h3>

                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Join thousands of teams who trust TeamFlow to manage projects,
                  collaborate seamlessly, and deliver results faster.
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
                      Real-time collaboration tools
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
                      Advanced project analytics
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
                      Secure file sharing & storage
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">50K+</div>
                    <div className="text-sm text-blue-200">Active Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">2M+</div>
                    <div className="text-sm text-blue-200">
                      Projects Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">150+</div>
                    <div className="text-sm text-blue-200">Countries</div>
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
                  © 2025 TeamFlow. Enterprise-grade collaboration platform.
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-600">
                <span
                  onClick={() => setCurrentPage("privacy")}
                  className="cursor-pointer hover:text-slate-900 transition-colors"
                >
                  Privacy Policy
                </span>
                <span
                  onClick={() => setCurrentPage("terms")}
                  className="cursor-pointer hover:text-slate-900 transition-colors"
                >
                  Terms of Service
                </span>
                <span
                  onClick={() => setCurrentPage("support")}
                  className="cursor-pointer hover:text-slate-900 transition-colors"
                >
                  Support
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default App;
