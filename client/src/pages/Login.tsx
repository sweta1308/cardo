import { Link } from 'react-router-dom'
import AuthShell from '../components/Auth/AuthShell'
import PasswordInput from '../components/Auth/PasswordInput'
import { inputClass, labelClass } from '../components/Auth/formStyles'
import Seo from '../components/Seo'

const Login = () => {
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

      <form className="mt-6 space-y-4">
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
          />
        </div>

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-brand-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand"
        >
          Sign in
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
