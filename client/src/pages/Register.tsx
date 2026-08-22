import { Link } from 'react-router-dom'
import AuthShell from '../components/Auth/AuthShell'
import PasswordInput from '../components/Auth/PasswordInput'
import { inputClass, labelClass } from '../components/Auth/formStyles'

const Register = () => {
  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">Get started with cardo</p>

      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            className={inputClass}
          />
        </div>

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

        <PasswordInput id="password" label="Password" placeholder="Create a password" autoComplete="new-password" />

        <PasswordInput
          id="confirm-password"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-brand-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}

export default Register
