import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { PropertyPage } from './pages/PropertyPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPropertyPage } from './pages/RegisterPropertyPage';
import { MyPropertiesPage } from './pages/MyPropertiesPage';
import { FractionalInvestmentsPage } from './pages/FractionalInvestmentsPage';
import { RentalDashboardPage } from './pages/RentalDashboardPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="property/:id" element={<PropertyPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="register-property" element={<RegisterPropertyPage />} />
        <Route path="my-properties" element={<MyPropertiesPage />} />
        <Route path="fractional-investments" element={<FractionalInvestmentsPage />} />
        <Route path="rental-dashboard" element={<RentalDashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
