import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Landing } from "./pages/Landing";
import { SignUp } from "./pages/SignUp";
import { SignIn } from "./pages/SignIn";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { MeetingRoom } from "./pages/MeetingRoom";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col font-sans text-white">
        <Routes>
          {/* Meeting Room doesn't have Navbar/Footer */}
          <Route path="/meeting/:id" element={<MeetingRoom />} />
          
          {/* Other pages have Navbar/Footer */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
