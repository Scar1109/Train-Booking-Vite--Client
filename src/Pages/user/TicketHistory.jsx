"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/NavBar"
import AxiosInstance from "../../AxiosInstance"
import { ArrowRightLeft, Clock, Calendar, Search } from "lucide-react"

const TicketHistory = () => {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get("/api/tickets")
      if (response.data.success) {
        // Filter tickets that have transfer history
        const ticketsWithTransfers = response.data.tickets.filter(
          (ticket) => ticket.transfers && ticket.transfers.length > 0,
        )
        setTickets(ticketsWithTransfers)
      } else {
        toast.error("Failed to fetch ticket history")
      }
    } catch (error) {
      console.error("Error fetching ticket history:", error)
      toast.error(error.response?.data?.message || "Failed to fetch ticket history")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter tickets based on search term
  const filteredTickets = tickets.filter((ticket) => {
    return (
      searchTerm === "" ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.trainName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="min-h-screen bg-railway-gray">
      <Navbar />
      <div className="page-container max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="page-title">Ticket Transfer History</h1>
          <p className="text-gray-600 animate-fade-in">View your ticket transfer activity</p>
        </header>

        {/* Search */}
        <div className="mb-6 flex justify-end">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-railway-blue focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-railway-blue"></div>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ticket
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Route
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Transfer Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-railway-lightBlue rounded-full flex items-center justify-center">
                            <ArrowRightLeft className="h-5 w-5 text-railway-blue" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</div>
                            <div className="text-sm text-gray-500">{ticket.trainName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.from} → {ticket.to}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Clock className="inline-block h-3 w-3 mr-1" />
                          {new Date(ticket.departureTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(ticket.transfers[ticket.transfers.length - 1].transferDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="inline-block h-3 w-3 mr-1" />
                          {ticket.transfers.length} transfer(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === "active"
                              ? "bg-green-100 text-green-800"
                              : ticket.status === "transferred"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => navigate(`/TicketList`)}
                          className="text-railway-blue hover:text-blue-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <ArrowRightLeft className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No transfer history found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "No transfers match your search criteria." : "You haven't transferred any tickets yet."}
            </p>
            <button
              onClick={() => navigate("/TicketList")}
              className="bg-railway-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Tickets
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketHistory
