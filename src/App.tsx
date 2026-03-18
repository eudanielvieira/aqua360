import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import FishListPage from './pages/FishListPage'
import FishCategoryPage from './pages/FishCategoryPage'
import FishDetailPage from './pages/FishDetailPage'
import PlantListPage from './pages/PlantListPage'
import PlantDetailPage from './pages/PlantDetailPage'
import DiseaseListPage from './pages/DiseaseListPage'
import DiseaseDetailPage from './pages/DiseaseDetailPage'
import CalculatorsPage from './pages/CalculatorsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/peixes" element={<FishListPage />} />
          <Route path="/peixes/:slug" element={<FishCategoryPage />} />
          <Route path="/peixes/:slug/:id" element={<FishDetailPage />} />
          <Route path="/plantas" element={<PlantListPage />} />
          <Route path="/plantas/:id" element={<PlantDetailPage />} />
          <Route path="/doencas" element={<DiseaseListPage />} />
          <Route path="/doencas/:id" element={<DiseaseDetailPage />} />
          <Route path="/calculadoras" element={<CalculatorsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
