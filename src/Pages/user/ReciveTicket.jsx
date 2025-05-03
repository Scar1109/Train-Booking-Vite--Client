"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/NavBar"
import TicketCard from "../../components/TicketCard"
import { CheckCircle2, AlertTriangle, User, Info, Shield } from "lucide-react"
import AxiosInstance from "../../AxiosInstance"

// Constants for configuration
const OTP_LENGTH = 6
const MAX_ID_LENGTH = 10
const TRANSFER_TIMEOUT = 3000

const ReceiveTicket = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const nameInputRef = useRef(null)
  const idInputRef = useRef(null)

  // State management for the component
  const [state, setState] = useState({
    isLoading: true,
    isValid: false,
    ticket: null,
    isAccepting: false,
    transferComplete: false,
    receiverName: "",
    receiverIdNumber: "",
    error: null,
  })

  // Form validation state
  const [validation, setValidation] = useState({
    nameError: "",
    idError: "",
    formTouched: false,
  })

  // Validate the transfer token
  const validateToken = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      if (!token || token.length === 0) {
        throw new Error("Invalid or missing transfer token")
      }

      const response = await AxiosInstance.get(`/api/tickets/transfer/validate/${token}`)

      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          isValid: true,
          ticket: response.data.ticket,
        }))

        toast.success("Transfer link is valid", {
          description: "Please complete your details to receive the ticket",
        })
      } else {
        throw new Error(response.data.message || "Invalid transfer link")
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isValid: false,
        error: error.response?.data?.message || error.message,
      }))
      toast.error(error.response?.data?.message || error.message || "Failed to validate transfer link")
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [token])

  // Run token validation on component mount
  useEffect(() => {
    validateToken()
  }, [validateToken])

  // Focus on name input when component loads
  useEffect(() => {
    if (state.isValid && !state.isLoading && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [state.isValid, state.isLoading])

  // Validate name input
  const validateName = (name) => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return "Full name is required"
    }
    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      return "Name must contain only letters and spaces"
    }
    if (trimmedName.length < 2) {
      return "Name must be at least 2 characters long"
    }

    return ""
  }

  // Validate ID number input
  const validateId = (id) => {
    if (!id) {
      return "ID number is required"
    }
    if (!/^\d+$/.test(id)) {
      return "ID number must contain only digits"
    }
    if (id.length !== MAX_ID_LENGTH) {
      return `ID number must be exactly ${MAX_ID_LENGTH} digits`
    }

    return ""
  }

  // Handle input changes for form fields with real-time validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value
    setState((prev) => ({ ...prev, [field]: value }))

    setValidation((prev) => ({
      ...prev,
      formTouched: true,
      [field === "receiverName" ? "nameError" : "idError"]:
        field === "receiverName" ? validateName(value) : validateId(value),
    }))
  }

  // Check if form is valid
  const isFormValid = () => {
    return !validation.nameError && !validation.idError && state.receiverName.trim() && state.receiverIdNumber
  }

  // Handle ticket acceptance process
  const handleAcceptTicket = async () => {
    // Set form as touched to show all validation errors
    setValidation((prev) => ({ ...prev, formTouched: true }))

    // Validate inputs before proceeding
    const nameError = validateName(state.receiverName)
    const idError = validateId(state.receiverIdNumber)

    setValidation((prev) => ({
      ...prev,
      nameError,
      idError,
    }))

    if (nameError || idError) {
      // Focus on the first field with an error
      if (nameError && nameInputRef.current) {
        nameInputRef.current.focus()
      } else if (idError && idInputRef.current) {
        idInputRef.current.focus()
      }
      return
    }

    setState((prev) => ({ ...prev, isAccepting: true }))

    try {
      const response = await AxiosInstance.post(`/api/tickets/transfer/complete/${token}`, {
        receiverName: state.receiverName.trim(),
        receiverIdNumber: state.receiverIdNumber,
      })

      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          ticket: response.data.ticket,
          transferComplete: true,
        }))

        toast.success("Ticket transfer completed successfully!", {
          description: "Redirecting to your tickets...",
        })

        setTimeout(() => navigate("/TicketList"), TRANSFER_TIMEOUT)
      } else {
        toast.error(response.data.message || "Failed to process transfer. Please try again.")
        setState((prev) => ({ ...prev, isAccepting: false }))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process transfer. Please try again.")
      setState((prev) => ({ ...prev, isAccepting: false }))
    }
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
                  <Shield className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Security Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your personal details will be associated with this ticket. Please ensure all information is
                      accurate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <section className="mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-railway-blue" />
                  Ticket Preview
                </h3>
                <TicketCard ticket={state.ticket} />
              </section>

              {/* Receiver Form - Enhanced UI */}
              <section className="mb-6 border border-gray-200 rounded-lg p-5 bg-gray-50">
                <h3 className="font-medium mb-4 flex items-center text-railway-blue">
                  <User className="h-5 w-5 mr-2" />
                  Enter Your Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={state.receiverName}
                        onChange={handleInputChange("receiverName")}
                        onBlur={() => setValidation((prev) => ({ ...prev, formTouched: true }))}
                        placeholder="Enter your full name"
                        className={`input-field pl-3 w-full ${validation.formTouched && validation.nameError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                        maxLength={50}
                        disabled={state.isAccepting}
                        aria-invalid={validation.nameError ? "true" : "false"}
                        aria-describedby="name-error"
                      />
                    </div>
                    {validation.formTouched && validation.nameError && (
                      <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {validation.nameError}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Enter your legal name as it appears on your ID</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={idInputRef}
                        type="text"
                        value={state.receiverIdNumber}
                        onChange={handleInputChange("receiverIdNumber")}
                        onBlur={() => setValidation((prev) => ({ ...prev, formTouched: true }))}
                        placeholder={`Enter ${MAX_ID_LENGTH}-digit ID`}
                        className={`input-field pl-3 w-full ${validation.formTouched && validation.idError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                        maxLength={MAX_ID_LENGTH}
                        disabled={state.isAccepting}
                        aria-invalid={validation.idError ? "true" : "false"}
                        aria-describedby="id-error"
                      />
                    </div>
                    {validation.formTouched && validation.idError && (
                      <p id="id-error" className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {validation.idError}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Must be a {MAX_ID_LENGTH}-digit national ID number</p>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                <button
                  onClick={() => navigate("/")}
                  className="btn-secondary flex-1 order-2 sm:order-1"
                  disabled={state.isAccepting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptTicket}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all order-1 sm:order-2 ${
                    isFormValid() && !state.isAccepting
                      ? "bg-railway-blue text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid() || state.isAccepting}
                >
                  {state.isAccepting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
            // Success state after transfer - Enhanced UI
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Transfer Successful!</h2>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Your ticket has been successfully transferred to your account and is now ready to use.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full max-w-md">
                <div className="flex">
                  <Shield className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800 text-sm">Ticket Secured</h3>
                    <p className="text-sm text-green-700 mt-1">
                      This ticket is now registered to {state.receiverName} and is ready for your journey.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/TicketList")}
                className="bg-railway-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                View My Tickets
              </button>
              <p className="text-sm text-gray-500 mt-4">You will be redirected automatically in a few seconds...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceiveTicket
