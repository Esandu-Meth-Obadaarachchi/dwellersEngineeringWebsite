import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CompanyPage } from './pages/CompanyPage'
import { ServicesPage } from './pages/ServicesPage'
import { LeadershipPage } from './pages/LeadershipPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ContactPage } from './pages/ContactPage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * One route per sheet. Paths must match the register in
 * src/data/site.ts, which owns the nav and the numbering.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="company" element={<CompanyPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="leadership" element={<LeadershipPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
