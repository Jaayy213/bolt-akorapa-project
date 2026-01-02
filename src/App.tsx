import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { ResultResolution } from './pages/ResultResolution';
import { Auth } from './pages/Auth';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-bg-core text-text-primary">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/resolve" element={<ResultResolution />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
