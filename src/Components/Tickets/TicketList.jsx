import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Link } from 'react-router-dom'
import '../../App.css'

const TicketList = ({ user }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTickets()
  }, [user])

  const fetchTickets = async () => {
    try {
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', user.uid),
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

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    return ticket.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading tickets...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Tickets</h1>
        <Link
          to="/tickets/create"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Ticket
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setFilter('all')}
        >
          All ({tickets.length})
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
            filter === 'open'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setFilter('open')}
        >
          Open ({tickets.filter(t => t.status === 'open').length})
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
            filter === 'in-progress'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({tickets.filter(t => t.status === 'in-progress').length})
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
            filter === 'resolved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({tickets.filter(t => t.status === 'resolved').length})
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 border-l-4 border-blue-400">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">
                  <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                </h3>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                    ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status.replace('-', ' ')}
                  </span>
                  {ticket.payment && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      Paid ₹{ticket.payment.amount}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{ticket.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className={`px-2 py-1 rounded ${
                  ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {ticket.priority} priority
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {ticket.category}
                </span>
                <span>
                  {ticket.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </span>
              </div>
              {ticket.payment && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Payment ID:</span>
                      <span className="font-mono text-gray-700">
                        {ticket.payment.razorpayPaymentId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="text-green-600 font-semibold">
                        ₹{ticket.payment.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {ticket.payment.status || 'Paid'} ✓
                      </span>
                    </div>
                    {ticket.payment.paymentDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Paid On:</span>
                        <span className="text-gray-700">
                          {new Date(ticket.payment.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-500 mb-6">Get priority support by creating your first ticket.</p>
            <Link
              to="/tickets/create"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first ticket
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketList
