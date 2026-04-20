import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GlobalLoader } from './components/GlobalLoader'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CampaignListPage } from './pages/CampaignListPage'
import { CampaignReportPage } from './pages/CampaignReportPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/Login'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalLoader />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignListPage />} />
            <Route
              path="/campaigns/:id/report"
              element={<CampaignReportPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
