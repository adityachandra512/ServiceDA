import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const AdminNavbar = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg border-b border-purple-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Admin Logo and Brand */}
          <div className="flex items-center">
            <Link
              to="/admin"
              className="flex items-center space-x-3 text-xl font-bold text-white hover:text-purple-200 transition duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex items-center space-x-2">
                <span className="hidden sm:block">Service Desk Admin</span>
                <span className="bg-yellow-400 text-purple-900 text-xs px-2 py-1 rounded-full font-bold hidden sm:block">
                  ADMIN
                </span>
              </div>
            </Link>
          </div>

          {/* Admin User Menu */}
          <div className="flex items-center space-x-4">
            {/* Admin Info */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center ring-2 ring-purple-400">
                  <span className="text-white text-sm font-bold">
                    {(user.displayName || user.email).charAt(0).toUpperCase()
                    }
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">
                  {user.displayName || user.email.split('@')[0]}
                </p>
                <p className="text-purple-200 text-xs">System Administrator</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-200 hover:text-white hover:bg-red-600 rounded-lg transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-purple-200 hover:text-white hover:bg-purple-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-purple-700">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/admin"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActiveRoute('/admin')
                ? 'bg-purple-700 text-white'
                : 'text-purple-200 hover:text-white hover:bg-purple-800'
            }`}
          >
            Admin Dashboard
          </Link>
          <Link
            to="/admin/tickets"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActiveRoute('/admin/tickets')
                ? 'bg-purple-700 text-white'
                : 'text-purple-200 hover:text-white hover:bg-purple-800'
            }`}
          >
            All Tickets
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar
