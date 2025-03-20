"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/Navbar"
import TicketCard from "../../components/TicketCard"
import { QrCode, Users, Search, ArrowRightLeft, AlertTriangle, CheckCircle2, Mail, Lock } from "lucide-react"
// Import the CSS file
import "../../css/Tansfer-Ticket.css"

// Dummy ticket data if none is passed through location state
const dummyTickets = [
  {
    id: 1,
    ticketNumber: "SR-12345",
    from: "Colombo Fort",
    to: "Kandy",
    departureTime: "2023-10-15T08:30:00",
    trainName: "Udarata Menike",
    coach: "A",
    seat: "15",
    passengerName: "John Perera",
    status: "active",
    qrCode: "SR-12345-COLOMBO-KANDY-20231015",
    transfers: [],
    transferLimit: 3,
    price: 750,
  },
  {
    id: 2,
    ticketNumber: "SR-12346",
    from: "Colombo Fort",
    to: "Galle",
    departureTime: "2023-10-18T16:45:00",
    trainName: "Ruhunu Kumari",
    coach: "B",
    seat: "22",
    passengerName: "John Perera",
    status: "active",
    qrCode: "SR-12346-COLOMBO-GALLE-20231018",
    transfers: [],
    transferLimit: 2,
    price: 950,
  },
]

// Dummy registered users for transfer
const registeredUsers = [
  {
    id: 1,
    name: "Sarah Silva",
    email: "sarah.silva@example.com",
    verified: true,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Michael Fernando",
    email: "michael.f@example.com",
    verified: true,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Priya Jayasinghe",
    email: "priya.j@example.com",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 4,
    name: "David Rajapakse",
    email: "david.r@example.com",
    verified: true,
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
  },
  {
    id: 5,
    name: "Amal Perera",
    email: "amal.p@example.com",
    verified: true,
    avatar: "https://randomuser.me/api/portraits/men/81.jpg",
  },
]

const TransferTicket = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const qrScannerRef = useRef(null)

  // Get ticket from location state or use dummy data
  const [selectedTicket, setSelectedTicket] = useState(location.state?.ticket || null)

  const [availableTickets, setAvailableTickets] = useState(dummyTickets)
  const [step, setStep] = useState(1)
  const [transferMethod, setTransferMethod] = useState("email")
  const [recipient, setRecipient] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [transferReason, setTransferReason] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)
  const [qrScanActive, setQrScanActive] = useState(false)
  const [securityPin, setSecurityPin] = useState("")

  // If a ticket was passed through location state, select it automatically
  useEffect(() => {
    if (location.state?.ticket) {
      setSelectedTicket(location.state.ticket)
      setStep(2)
    }
  }, [location.state])

  // Generate a random security PIN when transfer starts
  useEffect(() => {
    if (step === 3) {
      // Generate a random 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString()
      setSecurityPin(pin)
    }
  }, [step])

  // Handle searching for users
  const handleSearch = (e) => {
    const searchTerm = e.target.value
    setRecipient(searchTerm)

    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Simulate API call delay
    setTimeout(() => {
      const filtered = registeredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  // Handle selecting a user from search results
  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setRecipient(user.name)
    setSearchResults([])
  }

  // Handle ticket selection
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setStep(2)
  }

  // Toggle QR scanner
  const toggleQrScanner = () => {
    setQrScanActive(!qrScanActive)
    if (!qrScanActive) {
      // In a real app, we would initialize the QR scanner here
      setTimeout(() => {
        // Simulate finding a user via QR code scan
        const randomUser = registeredUsers[Math.floor(Math.random() * registeredUsers.length)]
        handleSelectUser(randomUser)
        setQrScanActive(false)
        toast.success(`Found user: ${randomUser.name}`)
      }, 3000)
    }
  }

  // Handle form submission for transfer
  const handleSubmitTransfer = (e) => {
    e.preventDefault()

    if (!selectedTicket || !selectedUser) {
      return
    }

    setIsTransferring(true)

    // Simulate API call for transfer
    setTimeout(() => {
      setIsTransferring(false)
      setTransferComplete(true)

      // After 3 seconds, redirect to history page
      setTimeout(() => {
        navigate("/history")
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-railway-gray">
      <Navbar />

      <div className="page-container max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="page-title">Transfer Your Ticket</h1>
          <p className="text-gray-600 animate-fade-in">Securely transfer your ticket to another registered user</p>
        </header>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? "bg-railway-blue text-white" : "bg-gray-200 text-gray-500"}`}
              >
                1
              </div>
              <div className={`ml-2 text-sm ${step >= 1 ? "text-railway-blue font-medium" : "text-gray-500"}`}>
                Select Ticket
              </div>
            </div>

            <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? "bg-railway-blue" : "bg-gray-200"}`}></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? "bg-railway-blue text-white" : "bg-gray-200 text-gray-500"}`}
              >
                2
              </div>
              <div className={`ml-2 text-sm ${step >= 2 ? "text-railway-blue font-medium" : "text-gray-500"}`}>
                Select Recipient
              </div>
            </div>

            <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? "bg-railway-blue" : "bg-gray-200"}`}></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? "bg-railway-blue text-white" : "bg-gray-200 text-gray-500"}`}
              >
                3
              </div>
              <div className={`ml-2 text-sm ${step >= 3 ? "text-railway-blue font-medium" : "text-gray-500"}`}>
                Confirm
              </div>
            </div>
          </div>
        </div>

        {/* Content based on current step */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <h2 className="section-title flex items-center">
              <ArrowRightLeft className="h-5 w-5 mr-2 text-railway-blue" />
              Select a ticket to transfer
            </h2>

            <div className="space-y-4 mt-4">
              {availableTickets
                .filter((ticket) => ticket.status === "active")
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id
                        ? "border-railway-blue bg-railway-lightBlue bg-opacity-50"
                        : "border-gray-200 hover:border-railway-blue"
                    }`}
                    onClick={() => handleSelectTicket(ticket)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{ticket.ticketNumber}</span>
                        <h3 className="font-semibold mt-1">
                          {ticket.from} → {ticket.to}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(ticket.departureTime).toLocaleDateString()} at{" "}
                          {new Date(ticket.departureTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {ticket.transferLimit && (
                          <p className="text-xs text-blue-600 mt-1">
                            {ticket.transferLimit - (ticket.transfers?.length || 0)} transfers remaining
                          </p>
                        )}
                      </div>

                      {selectedTicket?.id === ticket.id && (
                        <svg
                          className="h-6 w-6 text-railway-blue"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}

              {availableTickets.filter((ticket) => ticket.status === "active").length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500">You don't have any active tickets available for transfer.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => navigate("/TicketList")} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => selectedTicket && setStep(2)}
                disabled={!selectedTicket}
                className={`btn-primary ${!selectedTicket ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <h2 className="section-title flex items-center">
              <Users className="h-5 w-5 mr-2 text-railway-blue" />
              Select recipient
            </h2>

            {/* Transfer method selection */}
            <div className="mb-6 flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                className={`flex-1 py-2 px-3 flex items-center justify-center text-sm ${transferMethod === "email" ? "bg-railway-blue text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setTransferMethod("email")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Find by Email
              </button>
              <button
                className={`flex-1 py-2 px-3 flex items-center justify-center text-sm ${transferMethod === "qr" ? "bg-railway-blue text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setTransferMethod("qr")}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code
              </button>
            </div>

            {transferMethod === "email" && (
              <div className="mt-4">
                <div className="relative">
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                    Search for a registered user
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="recipient"
                      type="text"
                      value={recipient}
                      onChange={handleSearch}
                      placeholder="Name or email address"
                      className="input-field pl-10"
                    />
                  </div>

                  {isSearching && (
                    <div className="absolute right-3 top-9">
                      <svg
                        className="animate-spin h-5 w-5 text-railway-blue"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      <ul className="py-1">
                        {searchResults.map((user) => (
                          <li
                            key={user.id}
                            className="px-4 py-2 hover:bg-railway-lightBlue cursor-pointer flex items-center justify-between"
                            onClick={() => handleSelectUser(user)}
                          >
                            <div className="flex items-center">
                              {user.avatar ? (
                                <img
                                  src={user.avatar || "/placeholder.svg"}
                                  alt={user.name}
                                  className="h-8 w-8 rounded-full mr-3"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-railway-lightBlue mr-3 flex items-center justify-center text-railway-blue font-medium">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            {user.verified ? (
                              <span className="subtle-badge bg-green-100 text-green-800">Verified</span>
                            ) : (
                              <span className="subtle-badge bg-yellow-100 text-yellow-800">Unverified</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recipient && searchResults.length === 0 && !isSearching && (
                    <div className="mt-2 text-sm text-red-500 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      No users found matching your search.
                    </div>
                  )}
                </div>
              </div>
            )}

            {transferMethod === "qr" && (
              <div className="mt-4">
                <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center">
                  {qrScanActive ? (
                    <>
                      <div className="relative w-64 h-64 bg-black rounded-lg overflow-hidden mb-4">
                        <div className="absolute inset-0 flex items-center justify-center" ref={qrScannerRef}>
                          {/* Simulated video feed */}
                          <div className="w-full h-full bg-black opacity-80"></div>
                          <div className="absolute inset-0 border-2 border-white opacity-50"></div>
                          <div className="absolute w-40 h-40 border-2 border-railway-blue">
                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-railway-blue"></div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-railway-blue"></div>
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-railway-blue"></div>
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-railway-blue"></div>
                          </div>
                          {/* Scanning animation */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-railway-blue animate-scan"></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 text-center mb-4">Scanning for recipient's QR code...</p>
                      <button onClick={toggleQrScanner} className="btn-secondary">
                        Cancel Scan
                      </button>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="font-medium text-gray-700 mb-2">Scan Recipient's QR Code</h3>
                      <p className="text-sm text-gray-500 text-center mb-4">
                        Ask the recipient to show their account QR code to initiate a direct transfer.
                      </p>
                      <button onClick={toggleQrScanner} className="btn-primary">
                        Start Scanning
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar || "/placeholder.svg"}
                        alt={selectedUser.name}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-railway-lightBlue mr-3 flex items-center justify-center text-railway-blue font-medium">
                        {selectedUser.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">Selected recipient:</h3>
                      <p className="text-railway-blue">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>
                  {selectedUser.verified ? (
                    <span className="subtle-badge bg-green-100 text-green-800 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified User
                    </span>
                  ) : (
                    <span className="subtle-badge bg-yellow-100 text-yellow-800 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unverified User
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for transfer (optional)
              </label>
              <textarea
                id="reason"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="e.g. Sharing with a family member"
                className="input-field min-h-[80px]"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
              <button
                onClick={() => selectedUser && setStep(3)}
                disabled={!selectedUser}
                className={`btn-primary ${!selectedUser ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <h2 className="section-title flex items-center">
              <Lock className="h-5 w-5 mr-2 text-railway-blue" />
              Confirm Ticket Transfer
            </h2>

            <div className="mt-4">
              <p className="text-gray-600 mb-4">Please review the details below. Once you confirm the transfer:</p>

              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-2">
                <li>This ticket will no longer be valid for you</li>
                <li>The QR code will be invalidated and a new one will be generated for the recipient</li>
                <li>This action cannot be reversed</li>
                <li>A record of this transfer will be maintained for security purposes</li>
                <li>The remaining transfer count for this ticket will be reduced by 1</li>
              </ul>

              {/* Security PIN information */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <h3 className="font-medium text-yellow-800 flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Security Verification
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  For additional security, the recipient will need to enter this PIN to complete the transfer:
                </p>
                <div className="bg-white p-3 rounded border border-yellow-200 text-center">
                  <span className="text-xl tracking-widest font-mono font-bold text-yellow-800">{securityPin}</span>
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  Do not share this PIN with anyone other than the intended recipient.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Ticket Details:</h3>
                <TicketCard ticket={selectedTicket} />
              </div>

              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
                <h3 className="font-medium mb-1 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-railway-blue" />
                  Recipient:
                </h3>
                <div className="flex items-center">
                  {selectedUser?.avatar ? (
                    <img
                      src={selectedUser.avatar || "/placeholder.svg"}
                      alt={selectedUser.name}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-railway-lightBlue mr-2 flex items-center justify-center text-railway-blue font-medium">
                      {selectedUser?.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-railway-blue font-medium">{selectedUser?.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                  </div>
                </div>
                {transferReason && (
                  <>
                    <h3 className="font-medium mt-3 mb-1">Reason for transfer:</h3>
                    <p className="text-sm text-gray-700">{transferReason}</p>
                  </>
                )}
              </div>

              <div className="flex items-center mb-6">
                <input
                  id="confirm"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-railway-blue focus:ring-railway-blue border-gray-300 rounded"
                />
                <label htmlFor="confirm" className="ml-2 block text-sm text-gray-700">
                  I confirm that this transfer is legitimate and not for reselling purposes
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">
                Back
              </button>
              <button onClick={handleSubmitTransfer} className="btn-primary" disabled={isTransferring}>
                {isTransferring ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Confirm Transfer"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Transfer Success Modal */}
        {transferComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto animate-slide-up">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Transfer Successful!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  The ticket has been successfully transferred to {selectedUser?.name}.
                </p>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 text-left">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Security confirmation:</span> A notification has been sent to the
                    recipient with all ticket details and a secure access link.
                  </p>
                </div>
                <p className="text-xs text-gray-500 mb-4">Redirecting to your transfer history...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransferTicket

