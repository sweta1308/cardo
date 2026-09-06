import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from '../components/Auth/AuthShell'
import PasswordInput from '../components/Auth/PasswordInput'
import { inputClass, labelClass } from '../components/Auth/formStyles'
import Seo from '../components/Seo'
import { ApiError, login } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useWorkspaceStore } from '../store/workspaceStore'

const Login = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const resolveWorkspace = useWorkspaceStore((state) => state.resolveWorkspace)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      const { user, token } = await login(email, password)
      setAuth(user, token)
      toast.success(`Welcome back, ${user.name}`)

      const workspace = await resolveWorkspace()
      navigate(workspace ? '/dashboard' : '/onboarding')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <Seo
        title="Log In"
        description="Sign in to your Cardo workspace to plan sprints, track tasks, and collaborate with your team."
      />
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">Sign in to your workspace</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-full bg-brand-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-brand hover:text-brand-dark">
          Create one
        </Link>
      </p>
    </AuthShell>
  )
}

export default Login
