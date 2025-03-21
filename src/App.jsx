import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/user/Home";
import Login from "./Pages/auth/Login"
import Signup from "./Pages/auth/Signup"
import Gallery from "./Pages/user/Gallery"
import Terms from "./Pages/user/Terms"
import TrainsList from "./Pages/user/TrainsList"
import TicketShare from "./Pages/user/TicketList"
import UserProfile from "./Pages/user/UserProfile"
import AdminDashboard from "./Pages/admin/AdminDashboard"
import ContactUs from "./Pages/user/ContactUs"
import TransferTicket from "./Pages/user/TransferTicket"
import TicketHistory from "./Pages/user/TicketHistory"
import ReciveTicket from "./Pages/user/ReciveTicket"
import ProfilePage from "./Pages/user/ProfilePage";

function App() {
    return (
        <div className="App">
            <BrowserRouter basename="/">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/trains" element={<TrainsList />} />
                    <Route path="/TicketList" element={<TicketShare />} />
                    <Route path="/user-profile" element={<ProfilePage />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                    <Route path="/transfer" element={<TransferTicket/>}/>
                    <Route path="/ticket-history" element={<TicketHistory/>}/>
                    <Route path="/receive/:token" element={<ReciveTicket/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
