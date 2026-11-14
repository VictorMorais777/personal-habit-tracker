import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Habits from "./pages/Habits";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import FriendHabits from "./pages/FriendHabits";
import Stats from "./pages/Stats";
import ProtectedRoute from "./components/ProtectedRoute";
import ThemeToggle from "./components/ThemeToggle";
import Assistant from "./pages/Assistant";

function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>}/>
        <Route path="/friends/:userId" element={<ProtectedRoute><FriendHabits /></ProtectedRoute>}/>
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>}/>
        <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;