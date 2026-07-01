import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// Importar los frames
import Login from './pages/Login';
import Registro from './pages/Registro';

const PaginaTemporal = ({ titulo }: { titulo: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <h1 className="text-3xl font-bold text-blue-600">{titulo}</h1>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 2. Asignar los componentes reales a sus rutas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          <Route path="/cliente" element={<PaginaTemporal titulo="Panel del Cliente (Mapa)" />} />
          <Route path="/admin" element={<PaginaTemporal titulo="Panel Administrativo" />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;