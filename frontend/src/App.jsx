import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DeedsPage from './pages/DeedsPage.jsx';
import OwnersPage from './pages/OwnersPage.jsx';
import ContractsPage from './pages/ContractsPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import GISPage from './pages/GISPage.jsx';
import Layout from './components/layout/Layout.jsx';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/deeds"
          element={
            <PrivateRoute>
              <Layout>
                <DeedsPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/owners"
          element={
            <PrivateRoute>
              <Layout>
                <OwnersPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/contracts"
          element={
            <PrivateRoute>
              <Layout>
                <ContractsPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <PrivateRoute>
              <Layout>
                <PaymentsPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/gis"
          element={
            <PrivateRoute>
              <Layout>
                <GISPage />
              </Layout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
