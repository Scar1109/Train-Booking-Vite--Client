"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/Navbar"
import TicketCard from "../../components/TicketCard"
import { CheckCircle2, AlertTriangle, Lock, RefreshCw } from "lucide-react"

// Constants for configuration
const OTP_LENGTH = 6
const MAX_ID_LENGTH = 10
const TRANSFER_TIMEOUT = 3000
const API_DELAY = 1500

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

  // State management for the component
  const [state, setState] = useState({
    isLoading: true,
    isValid: false,
    ticket: null,
    otp: "",
    isAccepting: false,
    transferComplete: false,
    receiverName: "",
    receiverIdNumber: "",
    error: null,
  })

  // Generate a 6-digit OTP
  const generateOTP = useCallback(() => {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .padStart(OTP_LENGTH, "0")
  }, [])

  // Validate the transfer token
  const validateToken = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, API_DELAY))

      if (!token || token.length === 0) {
        throw new Error("Invalid or missing transfer token")
      }

      const newOtp = generateOTP()
      setState(prev => ({
        ...prev,
        isValid: true,
        ticket: dummyTicket,
        otp: newOtp,
      }))

      toast.success(`Your OTP is: ${newOtp}`, {
        duration: 10000,
        description: "Share this with the sender only",
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isValid: false,
        error: error.message,
      }))
      toast.error(error.message || "Failed to validate transfer link")
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [token, generateOTP])

  // Run token validation on component mount
  useEffect(() => {
    validateToken()
  }, [validateToken])

  // Handle input changes for form fields
  const handleInputChange = (field) => (e) => {
    const value = e.target.value
    setState(prev => ({ ...prev, [field]: value }))
  }

  // Validate user inputs (name and ID number)
  const validateInputs = () => {
    const trimmedName = state.receiverName.trim()

    // Name validation
    if (!trimmedName) {
      toast.error("Full name is required.")
      return false
    }
    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      toast.error("Full name must contain only letters and spaces.")
      return false
    }
    if (trimmedName.length < 2) {
      toast.error("Full name must be at least 2 characters long.")
      return false
    }

    // ID number validation
    if (!state.receiverIdNumber) {
      toast.error("ID number is required.")
      return false
    }
    if (!/^\d{10}$/.test(state.receiverIdNumber)) {
      toast.error(`ID number must be exactly ${MAX_ID_LENGTH} digits.`)
      return false
    }

    return true
  }

  // Handle ticket acceptance process
  const handleAcceptTicket = async () => {
    // Validate inputs before proceeding
    if (!validateInputs()) {
      return
    }

    setState(prev => ({ ...prev, isAccepting: true }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, API_DELAY))

      const updatedTicket = {
        ...state.ticket,
        passengerName: state.receiverName.trim(),
        passengerId: state.receiverIdNumber,
        transferDate: new Date().toISOString(),
      }

      setState(prev => ({
        ...prev,
        ticket: updatedTicket,
        transferComplete: true,
      }))

      toast.success("Ticket transfer completed successfully!", {
        description: "Redirecting to your tickets...",
      })

      setTimeout(() => navigate("/TicketList"), TRANSFER_TIMEOUT)
    } catch (error) {
      toast.error("Failed to process transfer. Please try again.")
      setState(prev => ({ ...prev, isAccepting: false }))
    }
  }

  // Regenerate OTP on user request
  const handleRegenerateOTP = () => {
    const newOtp = generateOTP()
    setState(prev => ({ ...prev, otp: newOtp }))
    toast.success(`New OTP generated: ${newOtp}`, {
      duration: 10000,
    })
  }

  // Render loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-railway-gray">
        <Navbar />
        <div className="page-container max-w-4xl flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-railway-blue border-t-transparent rounded-full mb-4 mx-auto" />
            <p className="text-gray-600">Validating transfer link...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render invalid state
  if (!state.isValid) {
    return (
      <div className="min-h-screen bg-railway-gray">
        <Navbar />
        <div className="page-container max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
            <div className="flex flex-col items-center justify-center py-6">
              <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Transfer Link</h2>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {state.error || "This ticket transfer link is invalid or has expired."}
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

  // Main render for valid state
  return (
    <div className="min-h-screen bg-railway-gray">
      <Navbar />
      <div className="page-container max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="page-title">Receive Your Ticket</h1>
          <p className="text-gray-600 animate-fade-in">Verify and accept your ticket transfer</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
          {!state.transferComplete ? (
            <>
              {/* Security Notice */}
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 mb-6">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Security Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Share the OTP only with the sender to verify this transfer securely.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <section className="mb-6">
                <h3 className="font-medium mb-2">Ticket Preview</h3>
                <TicketCard ticket={state.ticket} />
              </section>

              {/* Receiver Form */}
              <section className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">Enter Your Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={state.receiverName}
                      onChange={handleInputChange("receiverName")}
                      placeholder="Enter your full name"
                      className="input w-full"
                      maxLength={50}
                      disabled={state.isAccepting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={state.receiverIdNumber}
                      onChange={handleInputChange("receiverIdNumber")}
                      placeholder={`Enter ${MAX_ID_LENGTH}-digit ID`}
                      className="input w-full"
                      maxLength={MAX_ID_LENGTH}
                      disabled={state.isAccepting}
                    />
                  </div>
                </div>
              </section>

              {/* OTP Section */}
              <section className="mb-6 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-railway-blue" />
                    Your OTP
                  </h3>
                  <button
                    onClick={handleRegenerateOTP}
                    className="text-railway-blue hover:text-railway-dark flex items-center text-sm"
                    disabled={state.isAccepting}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <span className="text-2xl tracking-widest font-mono font-bold text-railway-blue">
                    {state.otp}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Valid for this transfer only. Share securely with sender.
                </p>
              </section>

              {/* Actions */}
              <div className="flex justify-between gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="btn-secondary flex-1"
                  disabled={state.isAccepting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptTicket}
                  className="btn-primary flex-1"
                  disabled={state.isAccepting}
                >
                  {state.isAccepting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Accept Transfer"
                  )}
                </button>
              </div>
            </>
          ) : (
            // Success state after transfer
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Your ticket has been successfully transferred. You will be redirected to your tickets shortly.
              </p>
              <button onClick={() => navigate("/TicketList")} className="btn-primary">
                View Tickets Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceiveTicket