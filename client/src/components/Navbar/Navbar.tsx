import { Link } from 'react-router-dom'
import logo from '../../assets/logo.webp'
import { ButtonLink } from '../ui/Button'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="container flex items-center justify-between px-4 py-3.5 sm:px-6 lg:px-16">
        <Link to="/">
          <img src={logo} alt="cardo" className="h-8 w-auto sm:h-9" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <ButtonLink to="/register">Get Started</ButtonLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
