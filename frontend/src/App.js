import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NotFound from './components/NotFound';

// Startup (user) pages
import Landing from './components/user/Landing';
import Register from './components/user/Register';
import Login from './components/user/Login';
import Home from './components/user/Home';

// Admin pages
import AdminLogin from './components/admin/Login';
import Admin from './components/admin/Admin';
import Progress from './components/admin/Progress';
import Report from './components/admin/Report';
import SelectReviewers from './components/admin/SelectReviewers';

// Reviewer pages
import ReviewerRegister from './components/reviewer/Register';
import ReviewerLogin from './components/reviewer/Login';
import ReviewerDashboard from './components/reviewer/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/report" element={<Report />} />
        <Route path="/progress/:startup" element={<Progress />} />
        <Route path="/selectreviewers/:id" element={<SelectReviewers type="eir" />} />
        <Route path="/grants/selectreviewers/:id" element={<SelectReviewers type="grant" />} />

        <Route path="/reviewer/register" element={<ReviewerRegister />} />
        <Route path="/reviewer/login" element={<ReviewerLogin />} />
        <Route path="/reviewer" element={<ReviewerDashboard />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
