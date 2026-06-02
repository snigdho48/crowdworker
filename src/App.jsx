import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/AppShell'
import { MarketingNav } from './components/MarketingNav'
import { CampaignForm } from './pages/CampaignForm'
import { CampaignList } from './pages/CampaignList'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { CreativeGallery } from './pages/CreativeGallery'
import { Home } from './pages/Home'
import { MediaPlan } from './pages/MediaPlan'
import { Services } from './pages/Services'
import { Portfolio } from './pages/Portfolio'
import { Team } from './pages/Team'
import { Blog } from './pages/Blog'
import { Report } from './pages/Report'
import { Settings } from './pages/Settings'
import { Help } from './pages/Help'
import { AuthProvider } from './context/AuthContext'

function RedirectCampaignEdit() {
  const { id } = useParams()
  return <Navigate to={`/app/campaigns/${id}/edit`} replace />
}

function RedirectReport() {
  const { search } = useLocation()
  return <Navigate to={`/app/report${search}`} replace />
}

function MarketingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <Outlet />
      <footer className="border-t border-white/10 bg-[#070a14]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="text-sm font-semibold text-white">Crowd Work</div>
              <div className="mt-2 text-sm leading-6 text-slate-200">
                A modern ad operations platform for campaign management, ingestion, and reporting.
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Pages
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <Link className="block hover:text-white" to="/about">
                  About
                </Link>
                <Link className="block hover:text-white" to="/services">
                  Services
                </Link>
                <Link className="block hover:text-white" to="/portfolio">
                  Portfolio
                </Link>
                <Link className="block hover:text-white" to="/team">
                  Team
                </Link>
                <Link className="block hover:text-white" to="/blog">
                  Blog
                </Link>
                <Link className="block hover:text-white" to="/contact">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                About company
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <span className="block">Our careers</span>
                <Link className="block hover:text-white" to="/services">
                  Services
                </Link>
                <Link className="block hover:text-white" to="/contact">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Contact
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <div>Dhaka, Bangladesh</div>
                <div>+880 1XXX-XXXXXX</div>
                <div>support@crowdwork.example</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-200 md:flex-row md:items-center">
            <div>© {new Date().getFullYear()} Crowd Work. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Facebook</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Instagram</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">X</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Dribbble</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
            <span>Privacy policy</span>
            <span>Terms & conditions</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/team" element={<Team />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/media-plan" element={<MediaPlan />} />
            <Route path="/creative-gallery" element={<CreativeGallery />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/campaigns" element={<Navigate to="/app/campaigns" replace />} />
            <Route path="/campaigns/new" element={<Navigate to="/app/campaigns/new" replace />} />
            <Route path="/campaigns/:id/edit" element={<RedirectCampaignEdit />} />
            <Route path="/report" element={<RedirectReport />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="campaigns" element={<CampaignList />} />
              <Route path="campaigns/new" element={<CampaignForm />} />
              <Route path="campaigns/:id/edit" element={<CampaignForm />} />
              <Route path="report" element={<Report />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
