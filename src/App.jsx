import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/user/Home";
import Login from "./Pages/auth/Login"
import Signup from "./Pages/auth/Signup"
import Gallery from "./Pages/user/Gallery"
import Terms from "./Pages/user/Terms"
import TrainsList from "./Pages/user/TrainsList"
import TicketShare from "./Pages/user/TicketShare"
import UserProfile from "./Pages/user/UserProfile"
import AdminDashboard from "./Pages/admin/AdminDashboard"
import ContactUs from "./Pages/user/ContactUs"

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
                    <Route path="/share-ticket" element={<TicketShare />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />

                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
