
import React, { useState } from 'react';
import {
  LayoutGrid,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login({ onSwitchToRegister }) {
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">

      {/* Ambient background */}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main card */}

      <div className="relative z-10 w-full max-w-md">

        <div className="glass-panel rounded-[28px] p-8 sm:p-10">

          {/* Brand */}

          <div className="flex flex-col items-center text-center mb-8">

            <div
              className="
                w-16
                h-16
                rounded-[20px]
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-indigo-500
                to-blue-500
                text-white
                shadow-[0_14px_35px_rgba(59,130,246,0.25)]
                mb-4
              "
            >
              <LayoutGrid
                size={30}
                strokeWidth={2}
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Agile Workspace
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Simple project management for focused teams.
            </p>

          </div>

          {/* Heading */}

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-slate-800">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Log in to keep managing your boards.
            </p>

          </div>

          {/* Error */}

          {error && (
            <div
              className="
                mb-5
                rounded-2xl
                border
                border-red-200/70
                bg-red-50/70
                backdrop-blur-md
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}

            <div>

              <label className="block text-sm font-medium text-slate-600 mb-2">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="
                    glass-input
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-2xl
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                  "
                />

              </div>

            </div>

            {/* Password */}

            <div>

              <label className="block text-sm font-medium text-slate-600 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={17}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="
                    glass-input
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-2xl
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                  "
                />

              </div>

            </div>

            {/* Login button */}

            <button
              type="submit"
              disabled={loading}
              className="
                group
                w-full
                flex
                items-center
                justify-center
                gap-2
                bg-gradient-to-br
                from-indigo-500
                to-blue-500
                hover:from-indigo-600
                hover:to-blue-600
                disabled:opacity-60
                disabled:cursor-not-allowed
                text-white
                font-medium
                py-3
                rounded-2xl
                shadow-[0_12px_25px_rgba(59,130,246,0.2)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  Log In
                  <ArrowRight
                    size={17}
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-0.5
                    "
                  />
                </>
              )}
            </button>

          </form>

          {/* Security note */}

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">

            <ShieldCheck size={14} />

            <span>
              Your account is securely authenticated.
            </span>

          </div>

          {/* Register */}

          <p className="text-sm text-slate-500 text-center mt-6">

            Don't have an account?{' '}

            <button
              type="button"
              onClick={onSwitchToRegister}
              className="
                text-indigo-600
                font-medium
                hover:text-indigo-700
                hover:underline
                transition-colors
              "
            >
              Sign up
            </button>

          </p>

        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Agile Workspace
        </p>

      </div>
    </div>
  );
}

