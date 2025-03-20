"use client"

import React, { useState } from "react"
import Navbar from "../../components/Navbar"
import { toast } from "sonner"
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Check,
  Calendar,
  User,
  Clock,
  History,
  Filter,
  ChevronDown,
  Info,
} from "lucide-react"
import "../../css/Tansfer-Ticket.css"

// Dummy transfer history data
const transferHistoryData = [
  {
    id: 1,
    ticketNumber: "SR-12347",
    route: "Colombo Fort → Anuradhapura",
    departureTime: "2023-10-12T07:15:00",
    transferType: "sent",
    timestamp: "2023-10-08T14:22:31",
    otherParty: "Sarah Silva",
    otherPartyEmail: "sarah.silva@example.com",
    otherPartyAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "completed",
    securityHash: "a7f9d2e1",
    blockchainVerified: true,
  },
  {
    id: 2,
    ticketNumber: "SR-11895",
    route: "Kandy → Colombo Fort",
    departureTime: "2023-09-28T16:30:00",
    transferType: "received",
    timestamp: "2023-09-25T09:15:20",
    otherParty: "Michael Fernando",
    otherPartyEmail: "michael.f@example.com",
    otherPartyAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "completed",
    securityHash: "b8e7c3a2",
    blockchainVerified: true,
  },
  {
    id: 3,
    ticketNumber: "SR-11458",
    route: "Colombo Fort → Galle",
    departureTime: "2023-09-18T10:15:00",
    transferType: "sent",
    timestamp: "2023-09-15T12:05:44",
    otherParty: "Amal Peris",
    otherPartyEmail: "amal.p@example.com",
    otherPartyAvatar: "https://randomuser.me/api/portraits/men/81.jpg",
    status: "cancelled",
    reason: "Cancelled by sender",
    securityHash: "c5d1b9a6",
    blockchainVerified: false,
  },
  {
    id: 4,
    ticketNumber: "SR-10987",
    route: "Colombo Fort → Jaffna",
    departureTime: "2023-08-22T20:30:00",
    transferType: "sent",
    timestamp: "2023-08-18T16:12:34",
    otherParty: "Kumara Bandara",
    otherPartyEmail: "kumara.b@example.com",
    status: "completed",
    securityHash: "d4c2b7a8",
    blockchainVerified: true,
  },
  {
    id: 5,
    ticketNumber: "SR-10349",
    route: "Batticaloa → Colombo Fort",
    departureTime: "2023-08-10T11:45:00",
    transferType: "received",
    timestamp: "2023-08-07T10:55:12",
    otherParty: "Chaminda Dias",
    otherPartyEmail: "chaminda.d@example.com",
    status: "completed",
    securityHash: "e3b1a9c7",
    blockchainVerified: true,
  },
]

const TicketHistory = () => {
  const [transferHistory, setTransferHistory] = useState(transferHistoryData)
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [expandedItem, setExpandedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Filter and sort the history
  const filteredAndSortedHistory = React.useMemo(() => {
    // First filter by type and status
    let filtered = transferHistory

    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.transferType === filterType)
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus)
    }

    // Apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.ticketNumber.toLowerCase().includes(query) ||
          item.route.toLowerCase().includes(query) ||
          item.otherParty.toLowerCase().includes(query),
      )
    }

    // Then sort
    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.timestamp) - new Date(a.timestamp)
      } else if (sortBy === "oldest") {
        return new Date(a.timestamp) - new Date(b.timestamp)
      } else if (sortBy === "departureSoon") {
        return new Date(a.departureTime) - new Date(b.departureTime)
      } else {
        return new Date(b.departureTime) - new Date(a.departureTime)
      }
    })
  }, [transferHistory, filterType, filterStatus, sortBy, searchQuery])

  const toggleExpandItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rejected":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransferTypeIcon = (type) => {
    if (type === "sent") {
      return (
        <div className="p-2 rounded-full bg-orange-100">
          <ArrowRight className="h-5 w-5 text-orange-600" />
        </div>
      )
    } else {
      return (
        <div className="p-2 rounded-full bg-blue-100">
          <ArrowLeft className="h-5 w-5 text-railway-blue" />
        </div>
      )
    }
  }

  const verifyOnBlockchain = (id) => {
    toast.success("Verified on blockchain: Ticket transfer is legitimate")
  }

  return (
    <div className="min-h-screen bg-railway-gray">
      <Navbar />

      <div className="page-container">
        <header className="mb-8">
          <h1 className="page-title flex items-center">
            <History className="h-6 w-6 mr-2 text-railway-blue" />
            Ticket Transfer History
          </h1>
          <p className="text-gray-600 mb-6 animate-fade-in">View all your transferred tickets and their status</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold mb-4 md:mb-0">Transfer History</h2>

            <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full md:w-auto px-3 py-1.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-railway-blue"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filter buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    filterType === "all"
                      ? "bg-railway-blue text-white border-railway-blue"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("sent")}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    filterType === "sent"
                      ? "bg-railway-blue text-white border-railway-blue"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Sent
                </button>
                <button
                  onClick={() => setFilterType("received")}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    filterType === "received"
                      ? "bg-railway-blue text-white border-railway-blue"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Received
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button className="flex items-center text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-1.5" />
                  {sortBy === "newest"
                    ? "Newest"
                    : sortBy === "oldest"
                      ? "Oldest"
                      : sortBy === "departureSoon"
                        ? "Departure (Soon)"
                        : "Departure (Later)"}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 hidden">
                  <div className="py-1">
                    <button
                      onClick={() => setSortBy("newest")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => setSortBy("oldest")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Oldest First
                    </button>
                    <button
                      onClick={() => setSortBy("departureSoon")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Departure (Soonest)
                    </button>
                    <button
                      onClick={() => setSortBy("departureLater")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Departure (Latest)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredAndSortedHistory.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredAndSortedHistory.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors animate-fade-in">
                  <div className="flex items-start">
                    {getTransferTypeIcon(item.transferType)}

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {item.transferType === "sent" ? "Sent to " : "Received from "}
                            <span className="text-railway-blue ml-1">{item.otherParty}</span>
                            {item.blockchainVerified && (
                              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                                <Check className="h-3 w-3 mr-0.5" />
                                Verified
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Ticket: <span className="font-medium">{item.ticketNumber}</span> • {item.route}
                          </p>
                        </div>
                        <span className={`subtle-badge ${getStatusColor(item.status)} flex-shrink-0`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>
                            {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Departure: {formatDate(item.departureTime)}</span>
                        </div>
                      </div>

                      {item.reason && (
                        <div className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {item.reason}
                        </div>
                      )}

                      <button
                        className="mt-3 text-railway-blue text-sm hover:text-blue-700 transition-colors flex items-center"
                        onClick={() => toggleExpandItem(item.id)}
                      >
                        {expandedItem === item.id ? (
                          <>
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                            Hide details
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            View details
                          </>
                        )}
                      </button>

                      {expandedItem === item.id && (
                        <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-4 animate-fade-in">
                          <h4 className="font-medium text-gray-700 mb-3">Transfer Details</h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">Transfer Parties</h5>
                              <div className="flex items-center mb-3">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      {item.transferType === "sent" ? "From:" : "To:"}
                                    </span>{" "}
                                    You
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      {item.transferType === "sent" ? "To:" : "From:"}
                                    </span>{" "}
                                    {item.otherParty}
                                  </p>
                                  <p className="text-xs text-gray-500">{item.otherPartyEmail}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">Security Information</h5>
                              <p className="text-sm mb-2">
                                <span className="font-medium">Transfer Hash:</span>
                                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
                                  {item.securityHash}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Verification:</span>
                                {item.blockchainVerified ? (
                                  <span className="ml-2 text-green-600 flex items-center text-xs">
                                    <Check className="h-3 w-3 mr-1" />
                                    Verified on blockchain
                                  </span>
                                ) : (
                                  <span className="ml-2 text-orange-600 flex items-center text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Not verified
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {!item.blockchainVerified && (
                            <button
                              onClick={() => verifyOnBlockchain(item.id)}
                              className="mt-4 w-full bg-railway-lightBlue text-railway-blue px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center justify-center"
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              Verify on blockchain
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">No transfers found</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "No transfers match your search criteria."
                  : filterType === "all"
                    ? "You haven't sent or received any ticket transfers yet."
                    : `You haven't ${filterType} any ticket transfers yet.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-railway-lightBlue text-railway-blue rounded-lg text-sm hover:bg-blue-100 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketHistory

