"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/NavBar"
import TicketCard from "../../components/TicketCard"
import { QrCode, ArrowRightLeft, AlertTriangle, CheckCircle2, Lock, Copy, Mail } from "lucide-react"
import "../../css/Tansfer-Ticket.css" // Import the CSS file
import AxiosInstance from "../../AxiosInstance"

const TransferTicket = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Get ticket from location state or use dummy data
  const [selectedTicket, setSelectedTicket] = useState(location.state?.ticket || null)
  const [availableTickets, setAvailableTickets] = useState([])
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
  const [recipientEmail, setRecipientEmail] = useState("")
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState("")

  // Confirmation checkbox state
  const [confirmChecked, setConfirmChecked] = useState(false)

  // Fetch available tickets when component mounts
  useEffect(() => {
    fetchAvailableTickets()
  }, [])

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

  // Fetch available tickets from the API
  const fetchAvailableTickets = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get("/api/tickets")
      if (response.data.success) {
        setAvailableTickets(response.data.tickets.filter((ticket) => ticket.status === "active"))
      } else {
        toast.error("Failed to fetch tickets")
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast.error(error.response?.data?.message || "Failed to fetch tickets")
    } finally {
      setIsLoading(false)
    }
  }

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

  // Generate and send OTP to recipient email
  const generateAndSendOtp = async () => {
    if (!recipientEmail || !selectedTicket) {
      toast.error("Please enter the recipient's email address")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsGeneratingOtp(true)

    try {
      const response = await AxiosInstance.post("/api/otp/generate", {
        recipientEmail,
        ticketId: selectedTicket._id,
        ticketDetails: {
          from: selectedTicket.from,
          to: selectedTicket.to,
          departureTime: selectedTicket.departureTime,
          trainName: selectedTicket.trainName,
          ticketNumber: selectedTicket.ticketNumber,
        },
      })

      if (response.data.success) {
        setOtpSent(true)
        toast.success("OTP sent successfully to the recipient's email")

        // Reset OTP input fields
        setOtpValue(["", "", "", "", "", ""])

        // Focus on the first OTP input field
        setTimeout(() => {
          const firstInput = document.getElementById("otp-0")
          if (firstInput) {
            firstInput.focus()
          }
        }, 500)
      } else {
        toast.error(response.data.message || "Failed to send OTP")
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setIsGeneratingOtp(false)
    }
  }

  // Handle OTP verification
  const verifyOtp = async () => {
    const enteredOtp = otpValue.join("")

    if (enteredOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    setIsVerifying(true)

    try {
      const response = await AxiosInstance.post("/api/otp/verify", {
        email: recipientEmail,
        otp: enteredOtp,
        ticketId: selectedTicket._id,
      })

      if (response.data.success) {
        setIsOtpValid(true)
        setTransferLink(response.data.transferLink)
        setQrCodeValue(response.data.transferLink)
        setToken(response.data.transferLink.split("/receive/")[1])

        // Check if email was sent successfully
        if (response.data.emailSent) {
          toast.success("OTP verified successfully and transfer link sent to recipient's email")
        } else {
          toast.success("OTP verified successfully")
        }

        setStep(3)
      } else {
        toast.error(response.data.message || "Invalid OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setIsVerifying(false)
    }
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
  const handleSubmitTransfer = async (e) => {
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

    try {
      // Since the email has already been sent during OTP verification,
      // we just need to update the ticket status
      const response = await AxiosInstance.post(`/api/tickets/transfer/complete/${token}`, {
        ticketId: selectedTicket._id,
        recipientEmail,
      })

      if (response.data.success) {
        setTransferComplete(true)
        toast.success("Ticket transfer completed successfully")

        // After 3 seconds, redirect to history page
        setTimeout(() => {
          navigate("/ticket-history")
        }, 3000)
      } else {
        toast.error(response.data.message || "Failed to complete transfer")
      }
    } catch (error) {
      console.error("Error completing transfer:", error)
      toast.error(error.response?.data?.message || "Failed to complete transfer")
    } finally {
      setIsTransferring(false)
    }
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
              <div className={`ml-2 text-sm ${step >= 1 ? "text-railway-blue font-medium" : "text-gray-500"}`}>
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
              <div className={`ml-2 text-sm ${step >= 2 ? "text-railway-blue font-medium" : "text-gray-500"}`}>
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
              <div className={`ml-2 text-sm ${step >= 3 ? "text-railway-blue font-medium" : "text-gray-500"}`}>
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
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-railway-blue"></div>
                </div>
              ) : (
                availableTickets
                  .filter((ticket) => ticket.status === "active")
                  .map((ticket) => (
                    <div
                      key={ticket._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTicket?._id === ticket._id
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

                        {selectedTicket?._id === ticket._id && (
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
                  ))
              )}

              {!isLoading && availableTickets.filter((ticket) => ticket.status === "active").length === 0 && (
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
                      A secure one-time link and QR code will be generated for this ticket transfer. This link will
                      expire in <span className="font-medium">30 minutes</span> for security purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Ticket Owner Details:</h3>
                <TicketCard ticket={selectedTicket} />
              </div>

              {/* Email OTP Section */}
              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-railway-blue" />
                  Send OTP to Recipient
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the recipient's email address to send them a verification OTP.
                </p>

                <div className="mb-4">
                  <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient's Email Address
                  </label>
                  <input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-field"
                    disabled={otpSent}
                  />
                </div>

                <button
                  onClick={generateAndSendOtp}
                  disabled={!recipientEmail || isGeneratingOtp || otpSent}
                  className={`w-full btn-primary mb-4 ${
                    !recipientEmail || isGeneratingOtp || otpSent ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isGeneratingOtp ? (
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
                      Sending OTP...
                    </div>
                  ) : otpSent ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      OTP Sent
                    </div>
                  ) : (
                    "Send OTP to Recipient"
                  )}
                </button>

                {otpSent && (
                  <>
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg mb-4">
                      <p className="text-sm text-green-800 flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          OTP has been sent to the recipient's email. Ask them to check their inbox and provide the
                          6-digit code.
                        </span>
                      </p>
                    </div>

                    <h3 className="font-medium mb-3 flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-railway-blue" />
                      Enter OTP from Recipient
                    </h3>

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
                  </>
                )}
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
                      The OTP has been verified and a transfer link has been sent to {recipientEmail}.
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

              <div className="mb-6">
                <h3 className="font-medium mb-2">Recipient Email:</h3>
                <p className="text-sm bg-gray-50 p-3 rounded-md border border-gray-200">{recipientEmail}</p>
              </div>

              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-6">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Transfer Link Sent</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      A transfer link has been sent to the recipient's email. They can use this link to claim the
                      ticket.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Transfer Link:</h3>
                <div className="relative">
                  <input type="text" value={transferLink} readOnly className="input-field pr-10 bg-gray-50 text-sm" />
                  <button
                    onClick={copyLinkToClipboard}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-railway-blue hover:text-railway-darkBlue"
                    aria-label="Copy link"
                  >
                    {isLinkCopied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This link has been sent to the recipient's email. You can also copy it manually if needed.
                </p>
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
