import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'

const AdminPanel = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [assignmentData, setAssignmentData] = useState({
    assignedTo: '',
    status: '',
    adminComment: ''
  })

  useEffect(() => {
    fetchAllTickets()
  }, [])

  const fetchAllTickets = async () => {
    try {
      const ticketsQuery = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(ticketsQuery)
      const ticketsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setTickets(ticketsList)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId, updates) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      // Add activity log
      await addDoc(collection(db, 'ticketActivities'), {
        ticketId,
        action: 'status_update',
        details: updates,
        timestamp: serverTimestamp(),
        adminEmail: 'admin@servicedesk.com' // In real app, get from auth
      })
      
      fetchAllTickets() // Refresh data
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const assignTicket = async (ticketId, assignedTo, status, comment) => {
    try {
      const updates = {
        assignedTo,
        status,
        updatedAt: serverTimestamp()
      }

      if (comment) {
        updates.adminComment = comment
      }

      await updateDoc(doc(db, 'tickets', ticketId), updates)
      
      // Add comment to ticket
      if (comment) {
        await addDoc(collection(db, 'ticketComments'), {
          ticketId,
          comment,
          author: 'Admin',
          isAdmin: true,
          timestamp: serverTimestamp()
        })
      }

      fetchAllTickets()
      setShowTicketModal(false)
      setAssignmentData({ assignedTo: '', status: '', adminComment: '' })
    } catch (error) {
      console.error('Error assigning ticket:', error)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    if (filter === 'unassigned') return !ticket.assignedTo
    return ticket.status === filter
  })

  const priorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin Panel
          </h1>
          <p className="mt-2 text-gray-600">Manage and track all support tickets across the platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
                <p className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'unassigned' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Unassigned ({tickets.filter(t => !t.assignedTo).length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'open' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Open ({tickets.filter(t => t.status === 'open').length})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'in-progress' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              In Progress ({tickets.filter(t => t.status === 'in-progress').length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === 'resolved' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Resolved ({tickets.filter(t => t.status === 'resolved').length})
            </button>
          </div>
        </div>

        {/* Enhanced Tickets Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Ticket Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {ticket.title}
                        </div>
                        <div className="text-sm text-gray-500">{ticket.category}</div>
                        <div className="text-xs text-gray-400">
                          {ticket.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {ticket.userEmail?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-gray-900">{ticket.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(ticket.status)}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.assignedTo || (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setShowTicketModal(true)
                          setAssignmentData({
                            assignedTo: ticket.assignedTo || '',
                            status: ticket.status,
                            adminComment: ''
                          })
                        }}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-md transition duration-200"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => updateTicketStatus(ticket.id, { status: 'resolved' })}
                        disabled={ticket.status === 'resolved'}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Management Modal */}
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Manage Ticket: {selectedTicket.title}
                  </h3>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Ticket Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Ticket Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">User:</span>
                      <span className="ml-2 text-gray-900">{selectedTicket.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 text-gray-900">{selectedTicket.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${priorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedTicket.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-500">Description:</span>
                    <p className="mt-1 text-gray-900 text-sm">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Assignment Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To
                    </label>
                    <select
                      value={assignmentData.assignedTo}
                      onChange={(e) => setAssignmentData({...assignmentData, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Support Agent</option>
                      <option value="John Smith">John Smith</option>
                      <option value="Sarah Johnson">Sarah Johnson</option>
                      <option value="Mike Wilson">Mike Wilson</option>
                      <option value="Emily Davis">Emily Davis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={assignmentData.status}
                      onChange={(e) => setAssignmentData({...assignmentData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Comment (Optional)
                    </label>
                    <textarea
                      value={assignmentData.adminComment}
                      onChange={(e) => setAssignmentData({...assignmentData, adminComment: e.target.value})}
                      rows={3}
                      placeholder="Add internal notes or customer communication..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => assignTicket(
                      selectedTicket.id,
                      assignmentData.assignedTo,
                      assignmentData.status,
                      assignmentData.adminComment
                    )}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Update Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
