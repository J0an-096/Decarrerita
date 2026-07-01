import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('http://localhost:3000/api/auth/login', { correo, password });
      const token = respuesta.data.token;
      const rol = respuesta.data.rol;

      if (!token || !rol) throw new Error("El formato de respuesta del servidor no coincide.");
      
      login(token, rol);

      Swal.fire({
        icon: 'success',
        title: 'Acceso Autorizado',
        text: `Bienvenido a Decarrerita, ${rol}`,
        timer: 2000,
        showConfirmButton: false,
        iconColor: '#4f46e5', // Color indigo-600
        confirmButtonColor: '#4f46e5'
      });

      if (rol === 'Cliente') navigate('/cliente');
      else if (rol === 'Chofer') navigate('/chofer');
      else navigate('/admin');

    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: error.response?.data?.error || error.response?.data?.mensaje || 'Credenciales incorrectas.',
        confirmButtonColor: '#ef4444' // Color red-500
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-slate-900 tracking-tight">
          Decarrerita
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Tu transporte seguro y rápido
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={manejarEnvio}>
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Correo Electrónico
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-slate-900 bg-slate-50 focus:bg-white"
                  placeholder="usuario@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Contraseña
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-slate-900 bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:-translate-y-1"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">¿Nuevo en la plataforma?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/registro"
                className="w-full flex justify-center py-3 px-4 border-2 border-indigo-100 rounded-xl shadow-sm text-sm font-bold text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
              >
                Crear una cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}