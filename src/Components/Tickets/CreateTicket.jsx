import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useNavigate } from 'react-router-dom'
import '../../App.css'

// Razorpay configuration
const RAZORPAY_KEY_ID = ''

const CreateTicket = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const navigate = useNavigate()

  const categories = [
    'technical', 'billing', 'account', 'feature-request', 'other'
  ]
  
  const priorities = [
    { value: 'low', label: 'Low', price: 99 },
    { value: 'medium', label: 'Medium', price: 199 },
    { value: 'high', label: 'High', price: 299 },
    { value: 'urgent', label: 'Urgent', price: 499 }
  ]

  const getTicketPrice = () => {
    const priority = priorities.find(p => p.value === formData.priority)
    return priority ? priority.price : 199
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }
    setShowPayment(true)
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setPaymentLoading(true)
    
    const res = await loadRazorpay()
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?')
      setPaymentLoading(false)
      return
    }

    try {
      if (!RAZORPAY_KEY_ID) {
        alert('Razorpay configuration missing. Please contact support.')
        setPaymentLoading(false)
        return
      }

      const amount = getTicketPrice() * 100 // Convert to paise
      
      // For demo purposes, create a fixed order ID
      const orderId = `order_${Date.now()}`
      
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Service Desk Support',
        description: `${formData.priority.toUpperCase()} Priority Support Ticket`,
        // Remove order_id to let Razorpay create it internally
        handler: async function (response) {
          try {
            console.log('Payment successful:', response)
            await handlePaymentSuccess(response, {
              id: orderId,
              amount: amount,
              currency: 'INR'
            })
          } catch (error) {
            console.error('Error creating ticket after payment:', error)
            alert('Payment successful but ticket creation failed. Please contact support.')
          }
        },
        prefill: {
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          contact: user.phoneNumber || ''
        },
        notes: {
          userId: user.uid,
          ticketTitle: formData.title,
          priority: formData.priority
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed')
            setPaymentLoading(false)
          }
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error)
        alert(`Payment failed: ${response.error.description}`)
        setPaymentLoading(false)
      })
      paymentObject.open()
    } catch (error) {
      console.error('Error initiating payment:', error)
      alert('Error initiating payment. Please try again.')
      setPaymentLoading(false)
    }
  }

  // Simplified payment success handler without verification
  const handlePaymentSuccess = async (paymentResponse, orderInfo) => {
    try {
      setLoading(true)
      
      // Create ticket with payment details
      const ticketData = {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedTo: null,
        comments: [],
        payment: {
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          amount: getTicketPrice(),
          currency: 'INR',
          status: 'paid',
          paidAt: serverTimestamp(),
          paymentDate: new Date().toISOString()
        }
      }

      await addDoc(collection(db, 'tickets'), ticketData)
      
      // Show success message
      alert(`Payment successful! Payment ID: ${paymentResponse.razorpay_payment_id}. Your support ticket has been created.`)
      
      navigate('/tickets')
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket. Please try again.')
    } finally {
      setLoading(false)
      setPaymentLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Support Ticket</h2>
          <p className="text-gray-600">Describe your issue and complete payment to get priority support</p>
          {/* Debug info */}
          <p className="text-xs text-gray-500 mt-1">
            Payment Config: {RAZORPAY_KEY_ID ? '✓ Ready' : '✗ Missing'} | 
            Test Mode: ✓ Active
          </p>
        </div>

        {!showPayment ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={handleFormSubmit}>
              <div className="grid lg:grid-cols-3 min-h-[600px]">
                {/* Left Side - Form Fields */}
                <div className="lg:col-span-2 p-8 space-y-6">
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Ticket Details</h3>
                    <p className="text-gray-600 text-sm">Please provide detailed information about your issue</p>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                      Ticket Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Unable to login to my account"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-lg"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">Provide a clear, concise summary of your issue</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                      Detailed Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="8"
                      placeholder="Please describe your issue in detail. Include:&#10;• What you were trying to do&#10;• What happened instead&#10;• Any error messages you received&#10;• Steps you've already tried to fix the issue"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                      required
                    />
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Be as detailed as possible to help us resolve your issue faster</span>
                      <span>{formData.description.length}/500</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-3">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-lg"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-3">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-lg"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label} - ₹{priority.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Side - Summary & Payment */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Summary Header */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Ticket Summary</h3>
                      <p className="text-gray-600 text-sm mt-1">Review your support request</p>
                    </div>

                    {/* Summary Details */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
                        <div className="mt-1 flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            formData.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            formData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                      <div className="text-center">
                        <p className="text-blue-100 text-sm font-medium">Total Amount</p>
                        <div className="text-4xl font-bold mt-2">₹{getTicketPrice()}</div>
                        <p className="text-blue-100 text-xs mt-1">One-time payment</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-400">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-100">Priority:</span>
                          <span className="font-medium">{formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-blue-100">Response Time:</span>
                          <span className="font-medium">
                            {formData.priority === 'urgent' ? '1 hour' :
                             formData.priority === 'high' ? '4 hours' :
                             formData.priority === 'medium' ? '24 hours' :
                             '48 hours'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mt-8">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-semibold text-lg flex items-center justify-center"
                    >
                      Proceed to Payment
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/tickets')}
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Payment Summary */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Complete Payment</h3>
                <p className="text-gray-600 mt-2">Review your ticket details and complete the payment</p>
              </div>

              {/* Ticket Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Ticket Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="font-medium text-gray-900">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      formData.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      formData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{getTicketPrice()}</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading || loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium flex items-center justify-center"
                  >
                    {paymentLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pay with Razorpay
                      </>
                    )}
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

export default CreateTicket
