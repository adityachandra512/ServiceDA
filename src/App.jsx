import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import './styles/auth.css'; // Import the new auth styles

// Components
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard/Dashboard'
import CreateTicket from './components/Tickets/CreateTicket'
import TicketList from './components/Tickets/TicketList'
import TicketDetail from './components/Tickets/TicketDetail'
import AdminPanel from './components/Admin/AdminPanel'
import Navbar from './components/Layout/Navbar'
import AdminNavbar from './components/Layout/AdminNavbar'
import Loading from './components/UI/Loading'

// App Content Component that uses useLocation
function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Enhanced admin check with multiple admin emails
        const adminEmails = [
          'admin@servicedesk.com',
          'support@servicedesk.com', 
          'manager@servicedesk.com',
          'admin@celebaltechnologies.com',
          'aditya@admin.com' // Add your personal admin email here
        ]
        setIsAdmin(adminEmails.includes(user.email))
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <>
          {isAdmin ? (
            <AdminNavbar user={user} />
          ) : (
            <Navbar user={user} isAdmin={false} />
          )}
        </>
      )}
      <main className={user ? "" : ""}>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : isAdmin ? (
            // Admin-only routes
            <>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/tickets" element={<AdminPanel />} />
              <Route path="/admin/agents" element={<div className="p-8 text-center text-gray-600">Support Agents Management - Coming Soon</div>} />
              <Route path="/admin/reports" element={<div className="p-8 text-center text-gray-600">Reports Dashboard - Coming Soon</div>} />
              <Route path="/admin/settings" element={<div className="p-8 text-center text-gray-600">Admin Settings - Coming Soon</div>} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </>
          ) : (
            // Regular user routes
            <>
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/tickets" element={<TicketList user={user} />} />
              <Route path="/tickets/create" element={<CreateTicket user={user} />} />
              <Route path="/tickets/:id" element={<TicketDetail user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  )
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
