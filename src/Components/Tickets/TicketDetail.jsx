import { useState, useEffect } from 'react'
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useParams, Link } from 'react-router-dom'
import '../../App.css'

const TicketDetail = ({ user }) => {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    fetchTicketData()
  }, [id])

  const fetchTicketData = async () => {
    try {
      // Fetch ticket
      const ticketDoc = await getDoc(doc(db, 'tickets', id))
      if (ticketDoc.exists()) {
        setTicket({ id: ticketDoc.id, ...ticketDoc.data() })
      }

      // Fetch comments
      const commentsQuery = query(
        collection(db, 'ticketComments'),
        where('ticketId', '==', id),
        orderBy('timestamp', 'asc')
      )
      const commentsSnapshot = await getDocs(commentsQuery)
      const commentsList = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setComments(commentsList)

      // Fetch activities
      const activitiesQuery = query(
        collection(db, 'ticketActivities'),
        where('ticketId', '==', id),
        orderBy('timestamp', 'desc')
      )
      const activitiesSnapshot = await getDocs(activitiesQuery)
      const activitiesList = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setActivities(activitiesList)

    } catch (error) {
      console.error('Error fetching ticket data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      await addDoc(collection(db, 'ticketComments'), {
        ticketId: id,
        comment: newComment,
        author: user.displayName || user.email,
        authorEmail: user.email,
        isAdmin: false,
        timestamp: serverTimestamp()
      })
      
      setNewComment('')
      fetchTicketData() // Refresh data
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      case 'in-progress':
        return <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      case 'resolved':
        return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading ticket...</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Ticket not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/tickets"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Tickets
          </Link
          >
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Ticket #{ticket.id.substring(0, 8)}</span>
                  <span>•</span>
                  <span>Created {ticket.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                  {ticket.assignedTo && (
                    <>
                      <span>•</span>
                      <span>Assigned to {ticket.assignedTo}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon(ticket.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                  ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Status Timeline</h3>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${ticket.status !== 'open' ? 'text-green-600' : 'text-blue-600'}`}>
                  <div className={`w-3 h-3 rounded-full ${ticket.status !== 'open' ? 'bg-green-500' : 'bg-blue-500'} mr-2`}></div>
                  <span className="text-sm font-medium">Created</span>
                </div>
                <div className={`flex-1 h-0.5 ${ticket.status === 'in-progress' || ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center ${ticket.status === 'in-progress' || ticket.status === 'resolved' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${ticket.status === 'in-progress' || ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <div className={`flex-1 h-0.5 ${ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center ${ticket.status === 'resolved' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                  <span className="text-sm font-medium">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication</h3>
              
              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className={`p-4 rounded-lg ${
                      comment.isAdmin ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50 border-l-4 border-gray-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            comment.isAdmin ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            <span className="text-white text-sm font-medium">
                              {comment.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">{comment.author}</span>
                          {comment.isAdmin && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Admin</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {comment.timestamp?.toDate?.()?.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-4">No comments yet.</p>
                )}
              </div>

              {/* Add Comment Form */}
              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <form onSubmit={submitComment} className="border-t pt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add a comment or provide additional information
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      placeholder="Provide additional details, ask questions, or update the support team..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {submittingComment ? 'Adding Comment...' : 'Add Comment'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="text-gray-800">{ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-800">
                    {ticket.createdAt?.toDate?.()?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="text-gray-800">
                    {ticket.updatedAt?.toDate?.()?.toLocaleDateString()}
                  </span>
                </div>
                {ticket.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned To:</span>
                    <span className="text-gray-800">{ticket.assignedTo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="text-sm">
                      <div className="text-gray-600">
                        {activity.action === 'status_update' && (
                          <span>Status changed to <strong>{activity.details.status}</strong></span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.timestamp?.toDate?.()?.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
