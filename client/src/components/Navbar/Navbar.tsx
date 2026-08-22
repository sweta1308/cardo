import { Link } from 'react-router-dom'
import logo from '../../assets/logo.webp'

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <Link to="/">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
      </Link>

      <ul className="flex items-center gap-6 text-sm font-medium text-gray-700">
        <li><Link to="/" className="hover:text-gray-900">Home</Link></li>
        <li><Link to="/about" className="hover:text-gray-900">About</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar
