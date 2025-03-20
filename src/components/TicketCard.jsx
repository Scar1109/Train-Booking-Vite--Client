"use client"

import { useState } from "react"
import QRCodeDisplay from "./QRCodeDisplay"
import { toast } from "sonner"
import { Clock, MapPin, Train, Users, ArrowRightLeft } from "lucide-react"
import "../css/Tansfer-Ticket.css"

const TicketCard = ({ ticket, showTransferButton = false, onTransfer = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQRFullscreen, setShowQRFullscreen] = useState(false)

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "transferred":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "used":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "expired":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  // Format price to Sri Lankan Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(price || 750)
  }

  // Calculate time left until departure
  const calculateTimeLeft = () => {
    const now = new Date()
    const departure = new Date(ticket.departureTime)
    const timeDiff = departure - now

    if (timeDiff <= 0) return "Departed"

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h ${minutes}m left`
    return `${minutes}m left`
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 ${isExpanded ? "scale-[1.01]" : ""}`}
    >
      <div className="relative">
        {/* Top part with route and status */}
        <div className="relative bg-gradient-to-r from-railway-blue to-blue-700 h-12 flex items-center justify-between px-4 text-white">
          <div className="flex items-center">
            <div className="w-8 h-8 flex-shrink-0 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Train className="h-4 w-4 text-white" />
            </div>
            <span className="ml-2 text-sm font-medium">#{ticket.ticketNumber}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)} border`}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </div>
        </div>

        {/* Time left indicator for active tickets */}
        {ticket.status === "active" && (
          <div className="bg-blue-50 px-4 py-1.5 flex items-center justify-between text-xs">
            <div className="text-railway-blue font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {calculateTimeLeft()}
            </div>
            <div className="text-gray-500">
              {ticket.transfers && ticket.transfers.length > 0
                ? `Transferred ${ticket.transfers.length} ${ticket.transfers.length === 1 ? "time" : "times"}`
                : "Original ticket"}
            </div>
          </div>
        )}

        {/* Main ticket content */}
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side with journey details */}
            <div className="flex-1">
              {/* Journey stations with animated line */}
              <div className="flex justify-between items-start mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-railway-lightBlue mb-2">
                    <MapPin className="h-5 w-5 text-railway-blue" />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">FROM</p>
                  <h3 className="font-semibold text-railway-darkGray">{ticket.from}</h3>
                </div>

                <div className="flex-grow px-4 pt-5 flex items-center justify-center">
                  <div className="h-0.5 bg-gray-200 w-full relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-railway-blue"></div>
                    <div className="absolute left-1/3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-gray-400"></div>
                    <div className="absolute left-2/3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-gray-400"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-railway-blue"></div>

                    {/* Animated train */}
                    <div className="absolute top-1/2 -translate-y-1/2 h-4 w-6 animate-[train_8s_linear_infinite]">
                      <svg
                        className="h-4 w-6 text-railway-blue"
                        viewBox="0 0 24 16"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20 0H4C1.8 0 0 1.8 0 4V8C0 10.2 1.8 12 4 12H5L3 14.8V16H7L9 13.2V12H15L17 14.8V16H21L19 12H20C22.2 12 24 10.2 24 8V4C24 1.8 22.2 0 20 0ZM5.5 8C4.7 8 4 7.3 4 6.5C4 5.7 4.7 5 5.5 5C6.3 5 7 5.7 7 6.5C7 7.3 6.3 8 5.5 8ZM12 6H8V4H12V6ZM18.5 8C17.7 8 17 7.3 17 6.5C17 5.7 17.7 5 18.5 5C19.3 5 20 5.7 20 6.5C20 7.3 19.3 8 18.5 8Z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-railway-lightBlue mb-2">
                    <MapPin className="h-5 w-5 text-railway-blue" />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">TO</p>
                  <h3 className="font-semibold text-railway-darkGray">{ticket.to}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">DATE</p>
                  <p className="font-medium text-railway-darkGray flex items-center">
                    <svg
                      className="h-4 w-4 mr-1 text-railway-blue"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(ticket.departureTime)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">TIME</p>
                  <p className="font-medium text-railway-darkGray flex items-center">
                    <svg
                      className="h-4 w-4 mr-1 text-railway-blue"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTime(ticket.departureTime)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">TRAIN</p>
                  <p className="font-medium text-railway-darkGray flex items-center">
                    <svg
                      className="h-4 w-4 mr-1 text-railway-blue"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {ticket.trainName || "Express"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">COACH & SEAT</p>
                  <p className="font-medium text-railway-darkGray flex items-center">
                    <svg
                      className="h-4 w-4 mr-1 text-railway-blue"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-7-10v2m0 16v-2"
                      />
                    </svg>
                    {ticket.coach} - {ticket.seat}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center">
                  <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">PASSENGER</p>
                    <p className="font-medium text-railway-darkGray">{ticket.passengerName}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">PRICE</p>
                    <p className="font-medium text-railway-darkGray">{formatPrice(ticket.price)}</p>
                  </div>
                </div>

                {ticket.transfers && ticket.transfers.length > 0 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                    <p className="text-xs text-yellow-700 uppercase tracking-wider font-medium flex items-center">
                      <ArrowRightLeft className="h-4 w-4 mr-1" />
                      TRANSFER HISTORY
                    </p>
                    <p className="text-sm text-yellow-800">
                      Transferred {ticket.transfers.length} {ticket.transfers.length === 1 ? "time" : "times"}
                    </p>
                    {ticket.transferLimit && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {ticket.transferLimit - (ticket.transfers?.length || 0)} transfers remaining
                      </p>
                    )}
                  </div>
                )}
              </div>

              {showTransferButton && ticket.status === "active" && (
                <button
                  onClick={() => {
                    if (ticket.transferLimit && ticket.transfers && ticket.transfers.length >= ticket.transferLimit) {
                      toast.error(`Maximum transfer limit (${ticket.transferLimit}) reached for this ticket`)
                      return
                    }
                    onTransfer(ticket)
                  }}
                  className="mt-6 bg-railway-blue text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  <ArrowRightLeft className="h-5 w-5 mr-2" />
                  Transfer This Ticket
                </button>
              )}
            </div>

            {/* Right side with QR code */}
            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <div
                onClick={() => setShowQRFullscreen(true)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <QRCodeDisplay value={ticket.qrCode} showActions={isExpanded} />
              </div>
              {!isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="mt-3 text-railway-blue text-sm hover:text-blue-700 transition-colors flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Show sharing options
                </button>
              )}
              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="mt-3 text-railway-blue text-sm hover:text-blue-700 transition-colors flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  Hide sharing options
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen QR Modal */}
      {showQRFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          onClick={() => setShowQRFullscreen(false)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 text-center">
              <h3 className="text-lg font-medium">Scan QR Code</h3>
              <p className="text-sm text-gray-500">Present this code for verification</p>
            </div>
            <div className="flex justify-center">
              <QRCodeDisplay value={ticket.qrCode} size="large" showActions={true} />
            </div>
            <button
              onClick={() => setShowQRFullscreen(false)}
              className="mt-6 w-full py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketCard
