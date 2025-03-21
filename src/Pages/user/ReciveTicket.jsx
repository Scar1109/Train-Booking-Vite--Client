"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/Navbar"
import TicketCard from "../../components/TicketCard"
import { CheckCircle2, AlertTriangle, Lock } from "lucide-react"

// Dummy ticket data for demonstration
const dummyTicket = {
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
}

const ReceiveTicket = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [otp, setOtp] = useState("")
  const [isAccepting, setIsAccepting] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)

  useEffect(() => {
    console.log("Token from URL:", token)

    // Simulate API call to validate token
    const validateToken = async () => {
      setIsLoading(true)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, we'll consider any non-empty token valid
      // In a real app, you would validate this against your backend
      if (token && token.length > 0) {
        setIsValid(true)
        setTicket(dummyTicket)

        // Generate a random 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        setOtp(generatedOtp)

        // In a real app, you would send this OTP to the recipient via SMS/email
        toast.success(`Your OTP is: ${generatedOtp}`, {
          duration: 10000,
        })
      } else {
        setIsValid(false)
        toast.error("Invalid or expired transfer link")
      }

      setIsLoading(false)
    }

    validateToken()
  }, [token])

  const handleAcceptTicket = () => {
    setIsAccepting(true)

    // Simulate API call
    setTimeout(() => {
      setIsAccepting(false)
      setTransferComplete(true)

      // After 3 seconds, redirect to tickets page
      setTimeout(() => {
        navigate("/TicketList")
      }, 3000)
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-railway-gray">
        <Navbar />
        <div className="page-container max-w-4xl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-railway-blue border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Validating transfer link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-railway-gray">
        <Navbar />
        <div className="page-container max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Transfer Link</h2>
              <p className="text-gray-600 text-center mb-6">
                This ticket transfer link is invalid or has expired for security reasons.
              </p>
              <button onClick={() => navigate("/")} className="btn-primary">
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-railway-gray">
      <Navbar />

      <div className="page-container max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="page-title">Receive Ticket</h1>
          <p className="text-gray-600 animate-fade-in">Someone is transferring a ticket to you</p>
        </header>

        {!transferComplete ? (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 mb-6">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Security Information</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    To complete this transfer, share the OTP below with the person sending you the ticket. Do not share
                    this OTP with anyone else.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Ticket Details:</h3>
              <TicketCard ticket={ticket} />
            </div>

            <div className="mb-6 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-railway-blue" />
                Your One-Time Password (OTP)
              </h3>
              <p className="text-sm text-gray-600 mb-4">Share this OTP with the sender to complete the transfer:</p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center mb-4">
                <span className="text-2xl tracking-widest font-mono font-bold text-railway-blue">{otp}</span>
              </div>

              <p className="text-xs text-gray-500">
                This OTP is valid only for this transfer and will expire when the transfer is complete.
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => navigate("/")} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleAcceptTicket} className="btn-primary" disabled={isAccepting}>
                {isAccepting ? (
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
                  "Accept Ticket"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Transfer Complete!</h2>
              <p className="text-gray-600 text-center mb-6">
                The ticket has been successfully transferred to your account.
              </p>
              <button onClick={() => navigate("/TicketList")} className="btn-primary">
                View My Tickets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReceiveTicket

