import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketCard from '../../components/TicketCard';
import Navbar from '../../components/Navbar'; // Ensure Navbar is imported

// Ticket data
const ticketData = [
  {
    id: 1,
    ticketNumber: 'SR-12345',
    from: 'Colombo Fort',
    to: 'Kandy',
    departureTime: '2023-10-15T08:30:00',
    trainName: 'Udarata Menike',
    coach: 'A',
    seat: '15',
    passengerName: 'John Perera',
    status: 'active',
    qrCode: 'SR-12345-COLOMBO-KANDY-20231015',
    transfers: [],
  },
  {
    id: 2,
    ticketNumber: 'SR-12346',
    from: 'Colombo Fort',
    to: 'Galle',
    departureTime: '2023-10-18T16:45:00',
    trainName: 'Ruhunu Kumari',
    coach: 'B',
    seat: '22',
    passengerName: 'John Perera',
    status: 'active',
    qrCode: 'SR-12346-COLOMBO-GALLE-20231018',
    transfers: [],
  },
  {
    id: 3,
    ticketNumber: 'SR-12347',
    from: 'Colombo Fort',
    to: 'Anuradhapura',
    departureTime: '2023-10-12T07:15:00',
    trainName: 'Rajarata Rajina',
    coach: 'A',
    seat: '08',
    passengerName: 'John Perera',
    status: 'used',
    qrCode: 'SR-12347-COLOMBO-ANURADHAPURA-20231012',
    transfers: [],
  },
];

const TicketShareComponent = () => {
  const [tickets, setTickets] = useState(ticketData);
  const navigate = useNavigate();

  const handleTransfer = (ticket) => {
    navigate('/transfer', { state: { ticket } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Smart Railway Ticketing System</h1>
            <p className="text-gray-600 mb-6 animate-fade-in">
              Secure, transparent, and fraud-resistant ticket management
            </p>
          </div>
          
          <div className="relative mt-8 mb-12 overflow-hidden rounded-xl bg-blue-600 py-10 px-8 shadow-lg max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5PSIwIiB4Mj0iMCIgeTI9IjQwIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-10"></div>
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 text-white text-left">
                  <h2 className="text-2xl font-semibold mb-2">Ticket Transfer System</h2>
                  <p className="mb-4">Transfer your tickets to friends or family securely without the risk of fraud or duplication.</p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button onClick={() => navigate('/transfer')} className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                      Transfer a Ticket
                      <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    <button onClick={() => navigate('/receive/tick254')} className="inline-flex items-center bg-blue-500 text-white border border-white border-opacity-30 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                      Receive a Ticket
                      <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="md:ml-8 mt-6 md:mt-0">
                  <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Tickets</h2>
            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {tickets.filter(t => t.status === 'active').length} Active Tickets
            </div>
          </div>
          
          <div className="space-y-6">
            {tickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                showTransferButton={ticket.status === 'active'} 
                onTransfer={handleTransfer}
              />
            ))}
            
            {tickets.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">You don't have any tickets yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TicketShareComponent;
