import { Link } from 'react-router-dom'
import logo from '../../assets/logo.webp'

const Navbar = () => {
  return (
    <nav className="container sticky shadow-md top-0 z-50 flex items-center justify-between bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-16">
      <Link to="/">
        <img src={logo} alt="cardo" className="h-9 w-auto sm:h-10 lg:h-12" />
      </Link>

      <div className="flex items-center gap-3 sm:gap-8">
        <a href="#" className="text-base font-medium text-gray-700 hover:text-brand-dark">Log in</a>
        <a
          href="#"
          className="rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand sm:px-5 sm:py-2.5"
        >
          Get Started
        </a>
      </div>
    </nav>
  )
}

export default Navbar
