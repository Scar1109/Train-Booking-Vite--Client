"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/NavBar"
import TicketCard from "../../components/TicketCard"
import { 
  QrCode, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Copy, 
  Timer 
} from "lucide-react"
import "../../css/Tansfer-Ticket.css" // Import the CSS file

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

const TransferTicket = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Get ticket from location state or use dummy data
  const [selectedTicket, setSelectedTicket] = useState(location.state?.ticket || null)
  const [availableTickets, setAvailableTickets] = useState(dummyTickets)
  const [step, setStep] = useState(1)
  const [transferReason, setTransferReason] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)

  // New state variables for the updated flow
  const [transferLink, setTransferLink] = useState("")
  const [qrCodeValue, setQrCodeValue] = useState("")
  const [expiryTime, setExpiryTime] = useState(null)
  const [remainingTime, setRemainingTime] = useState("")
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""])
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [isOtpValid, setIsOtpValid] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Confirmation checkbox state
  const [confirmChecked, setConfirmChecked] = useState(false)

  // If a ticket was passed through location state, select it automatically
  useEffect(() => {
    if (location.state?.ticket) {
      setSelectedTicket(location.state.ticket)
      setStep(2)
    }
  }, [location.state])

  // Generate a transfer link and QR code when moving to step 2
  useEffect(() => {
    if (step === 2 && selectedTicket) {
      // Generate a random token for the transfer link
      const token = Math.random().toString(36).substring(2, 15) 
                  + Math.random().toString(36).substring(2, 15)
      const baseUrl = window.location.origin
      const link = `${baseUrl}/receive-ticket/${token}`
      setTransferLink(link)
      setQrCodeValue(link)

      // Set expiry time to 30 minutes from now
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 30)
      setExpiryTime(expiry)
    }
  }, [step, selectedTicket])

  // Update remaining time every second
  useEffect(() => {
    if (!expiryTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = expiryTime.getTime() - now.getTime()

      if (diff <= 0) {
        clearInterval(interval)
        setRemainingTime("Expired")
        toast.error("Transfer link has expired. Please generate a new one.")
        setStep(1)
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [expiryTime])

  // Handle ticket selection
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setStep(2)
  }

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    const newOtp = [...otpValue]
    newOtp[index] = value
    setOtpValue(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  // Handle OTP verification
  const verifyOtp = () => {
    setIsVerifying(true)

    // Simulate API call for OTP verification
    setTimeout(() => {
      const enteredOtp = otpValue.join("")
      // In a real app, verify this with your backend
      // For demo, any 6-digit numeric OTP is considered valid
      const isValid = enteredOtp.length === 6 && /^\d+$/.test(enteredOtp)

      setIsOtpValid(isValid)
      setIsVerifying(false)

      if (isValid) {
        setStep(3)
      } else {
        toast.error("Invalid OTP. Please try again.")
      }
    }, 1500)
  }

  // Copy transfer link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(transferLink)
      .then(() => {
        setIsLinkCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setIsLinkCopied(false), 3000)
      })
      .catch((err) => {
        toast.error("Failed to copy link")
      })
  }

  // Handle form submission for transfer
  const handleSubmitTransfer = (e) => {
    e.preventDefault()

    if (!selectedTicket) {
      return
    }

    // If the user hasn't checked confirmation, don't proceed
    if (!confirmChecked) {
      toast.error("Please confirm that this transfer is legitimate.")
      return
    }

    setIsTransferring(true)

    // Simulate API call for transfer
    setTimeout(() => {
      setIsTransferring(false)
      setTransferComplete(true)

      // After 3 seconds, redirect to history page
      setTimeout(() => {
        navigate("/ticket-history")
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-railway-gray">
      <Navbar />

      <div className="page-container max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="page-title">Transfer Your Ticket</h1>
          <p className="text-gray-600 animate-fade-in">Securely transfer your ticket to another user</p>
        </header>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  step >= 1 ? "bg-railway-blue text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div
                className={`ml-2 text-sm ${
                  step >= 1 ? "text-railway-blue font-medium" : "text-gray-500"
                }`}
              >
                Select Ticket
              </div>
            </div>

            <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? "bg-railway-blue" : "bg-gray-200"}`} />

            {/* Step 2 */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  step >= 2 ? "bg-railway-blue text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <div
                className={`ml-2 text-sm ${
                  step >= 2 ? "text-railway-blue font-medium" : "text-gray-500"
                }`}
              >
                Generate Link
              </div>
            </div>

            <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? "bg-railway-blue" : "bg-gray-200"}`} />

            {/* Step 3 */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  step >= 3 ? "bg-railway-blue text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <div
                className={`ml-2 text-sm ${
                  step >= 3 ? "text-railway-blue font-medium" : "text-gray-500"
                }`}
              >
                Confirm
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Select Ticket */}
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

        {/* Step 2: Generate Link / QR */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <h2 className="section-title flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-railway-blue" />
              Secure Transfer Link
            </h2>

            <div className="mt-4">
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Security Information</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      A secure one-time link and QR code have been generated for this ticket transfer. This link will
                      expire in <span className="font-medium">{remainingTime}</span> for security purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Ticket Owner Details:</h3>
                <TicketCard ticket={selectedTicket} />
              </div>

              <div className="mb-6 flex flex-col md:flex-row gap-6">
                {/* QR Code */}
                <div className="flex-1 border border-gray-200 rounded-lg p-4 flex flex-col items-center">
                  <h3 className="font-medium mb-3 text-center">Scan QR Code</h3>
                  <div className="bg-white p-2 border border-gray-300 rounded-lg mb-3">
                    {/* Simulated QR code - in a real app, use a QR code library */}
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-railway-blue" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Let the recipient scan this QR code to access the ticket
                  </p>
                </div>

                {/* Transfer Link */}
                <div className="flex-1 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Share Transfer Link</h3>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={transferLink} 
                      readOnly 
                      className="input-field pr-10 bg-gray-50 text-sm" 
                    />
                    <button
                      onClick={copyLinkToClipboard}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-railway-blue hover:text-railway-darkBlue"
                      aria-label="Copy link"
                    >
                      {isLinkCopied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Send this link to the recipient. The link will expire in {remainingTime}.
                  </p>

                  <div className="mt-4 flex items-center">
                    <Timer className="h-4 w-4 text-railway-blue mr-2" />
                    <span className="text-sm font-medium">Expires in: {remainingTime}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-railway-blue" />
                  Enter OTP from Recipient
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ask the recipient to share the OTP they received after accessing the transfer link.
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2 mb-4">
                  {otpValue.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-railway-blue"
                    />
                  ))}
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={otpValue.join("").length !== 6 || isVerifying}
                  className={`w-full btn-primary ${
                    otpValue.join("").length !== 6 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
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
                      Verifying...
                    </div>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>

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
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Transfer */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <h2 className="section-title flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-railway-blue" />
              Confirm Ticket Transfer
            </h2>

            <div className="mt-4">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50 mb-6">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">OTP Verified Successfully</h3>
                    <p className="text-sm text-green-700 mt-1">
                      The OTP has been verified. You can now complete the ticket transfer.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">Please review the details below. Once you confirm the transfer:</p>

              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-2">
                <li>This ticket will no longer be valid for you</li>
                <li>The QR code will be invalidated and a new one will be generated for the recipient</li>
                <li>This action cannot be reversed</li>
                <li>A record of this transfer will be maintained for security purposes</li>
                <li>The remaining transfer count for this ticket will be reduced by 1</li>
              </ul>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Ticket Details:</h3>
                <TicketCard ticket={selectedTicket} />
              </div>

              {transferReason && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
                  <h3 className="font-medium mb-1">Reason for transfer:</h3>
                  <p className="text-sm text-gray-700">{transferReason}</p>
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div className="flex items-center mb-6">
                <input
                  id="confirm"
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={() => setConfirmChecked(!confirmChecked)}
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
              <button 
                onClick={handleSubmitTransfer} 
                className="btn-primary" 
                disabled={!confirmChecked || isTransferring}
              >
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
                  The ticket has been successfully transferred to the recipient.
                </p>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 text-left">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Security confirmation:</span> The recipient now has full access to the
                    ticket details and can use it for their journey.
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
