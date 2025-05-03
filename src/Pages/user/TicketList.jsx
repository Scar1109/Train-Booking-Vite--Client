"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Navbar from "../../components/NavBar"
import TicketCard from "../../components/TicketCard"
import AxiosInstance from "../../AxiosInstance"
import { Ticket, Search } from "lucide-react"

const TicketList = () => {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
    setIsLoading(true);
    const response = await AxiosInstance.get("/api/tickets");
    if (response.data.success) {
      setTickets(response.data.tickets);  // Update tickets state with the fetched tickets
    } else {
      toast.error("Failed to fetch tickets");
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
    toast.error(error.response?.data?.message || "Failed to fetch tickets");
  } finally {
    setIsLoading(false);
  }
  }

  const handleTransfer = (ticket) => {
    navigate("/transfer", { state: { ticket } })
  }

  // Filter tickets based on status and search term
  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter = filter === "all" || ticket.status === filter
    const matchesSearch =
      searchTerm === "" ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.trainName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-railway-gray">
      <Navbar />
      <div className="page-container max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="page-title">My Tickets</h1>
          <p className="text-gray-600 animate-fade-in">View and manage your train tickets</p>
        </header>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "all" ? "bg-railway-blue text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "active" ? "bg-railway-blue text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("transferred")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "transferred" ? "bg-railway-blue text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Transferred
            </button>
            <button
              onClick={() => setFilter("used")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "used" ? "bg-railway-blue text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Used
            </button>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-railway-blue focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-railway-blue"></div>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                showTransferButton={ticket.status === "active"}
                onTransfer={handleTransfer}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <Ticket className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">
              {filter !== "all"
                ? `You don't have any ${filter} tickets.`
                : searchTerm
                  ? "No tickets match your search criteria."
                  : "You haven't booked any tickets yet."}
            </p>
            <button
              onClick={() => navigate("/trains")}
              className="bg-railway-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book a Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketList
