import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.webp'
import AuthIllustration from './AuthIllustration'

interface AuthShellProps {
  children: ReactNode
}

const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-6">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <AuthIllustration />

        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 md:w-1/2">
          <Link to="/" className="mb-8 inline-flex">
            <img src={logo} alt="cardo" className="h-8 w-auto" />
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthShell
