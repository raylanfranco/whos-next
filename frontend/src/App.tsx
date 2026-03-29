import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import BookingsPage from './pages/dashboard/BookingsPage'
import ServicesPage from './pages/dashboard/ServicesPage'
import CustomersPage from './pages/dashboard/CustomersPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import BookingPage from './pages/BookingPage'
import MockDashboard from './pages/MockDashboard'

export default function App() {
  return (
    <div className="safe-area-pad">
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/preview" element={<MockDashboard />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<BookingsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/book/:merchantId" element={<BookingPage />} />
    </Routes>
    </div>
  )
}
