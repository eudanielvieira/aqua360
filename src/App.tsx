import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { usePageTracking } from './hooks/usePageTracking'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import FishListPage from './pages/FishListPage'
import FishCategoryPage from './pages/FishCategoryPage'
import FishDetailPage from './pages/FishDetailPage'
import PlantListPage from './pages/PlantListPage'
import PlantDetailPage from './pages/PlantDetailPage'
import CoralListPage from './pages/CoralListPage'
import CoralDetailPage from './pages/CoralDetailPage'
import DiseaseListPage from './pages/DiseaseListPage'
import DiseaseDetailPage from './pages/DiseaseDetailPage'
import CalculatorsPage from './pages/CalculatorsPage'
import CompatibilityPage from './pages/CompatibilityPage'
import AquariumBuilderPage from './pages/AquariumBuilderPage'
import SearchPage from './pages/SearchPage'
import GlossaryPage from './pages/GlossaryPage'
import GuidesPage from './pages/GuidesPage'
import SupportPage from './pages/SupportPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  usePageTracking()

  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path="/peixes" element={<FishListPage />} />
          <Route path="/peixes/:slug" element={<FishCategoryPage />} />
          <Route path="/peixes/:slug/:id" element={<FishDetailPage />} />
          <Route path="/plantas" element={<PlantListPage />} />
          <Route path="/plantas/:id" element={<PlantDetailPage />} />
          <Route path="/corais" element={<CoralListPage />} />
          <Route path="/corais/:id" element={<CoralDetailPage />} />
          <Route path="/doencas" element={<DiseaseListPage />} />
          <Route path="/doencas/:id" element={<DiseaseDetailPage />} />
          <Route path="/calculadoras" element={<CalculatorsPage />} />
          <Route path="/compatibilidade" element={<CompatibilityPage />} />
          <Route path="/montar-aquario" element={<AquariumBuilderPage />} />
          <Route path="/busca" element={<SearchPage />} />
          <Route path="/glossario" element={<GlossaryPage />} />
          <Route path="/guias" element={<GuidesPage />} />
          <Route path="/apoie" element={<SupportPage />} />
          <Route path="/sobre" element={<AboutPage />} />
        </Route>
      </Routes>
  )
}
