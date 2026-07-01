import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cedula: '',
    nombreCompleto: '',
    telefono: '',
    correo: '',
    password: '',
    rol: 'Chofer' 
  });

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let valorLimpio = value;

    // Sanitización en tiempo real para la Cédula
    if (name === 'cedula') {
      // 1. Extrae solo los números de lo que el usuario escribió
      const soloNumeros = value.replace(/\D/g, '');
      // 2. Le inyecta la "V-" al principio obligatoriamente
      valorLimpio = soloNumeros ? `V-${soloNumeros}` : '';
    }

    // Sanitización en tiempo real para el Teléfono (Ej: 0424-9263787)
    if (name === 'telefono') {
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length > 4) {
        valorLimpio = `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4, 11)}`;
      } else {
        valorLimpio = soloNumeros;
      }
    }

    setFormData({ ...formData, [name]: valorLimpio });
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('http://localhost:3000/api/auth/registro', formData);
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada!',
        text: respuesta.data.mensaje,
        confirmButtonColor: '#4f46e5'
      });
      navigate('/login'); 
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: error.response?.data?.error || 'Hubo un problema al crear la cuenta',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Clases compartidas para mantener el código limpio (Design System)
  const inputCSS = "appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-slate-900 bg-slate-50 focus:bg-white mt-2";
  const labelCSS = "block text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200 sm:rounded-2xl sm:px-12 border border-slate-100">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Únete a Decarrerita</h2>
            <p className="mt-2 text-sm text-slate-500">Completa tus datos para comenzar a operar</p>
          </div>
          
          <form onSubmit={manejarEnvio} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCSS}>Cédula</label>
                <input name="cedula" type="text" required onChange={manejarCambio} className={inputCSS} placeholder="V-12345678" />
              </div>
              <div>
                <label className={labelCSS}>Teléfono</label>
                <input name="telefono" type="text" required onChange={manejarCambio} className={inputCSS} placeholder="0414-0000000" />
              </div>
            </div>

            <div>
              <label className={labelCSS}>Nombre Completo</label>
              <input name="nombreCompleto" type="text" required onChange={manejarCambio} className={inputCSS} placeholder="Ej. Juan Pérez" />
            </div>

            <div>
              <label className={labelCSS}>Correo Electrónico</label>
              <input name="correo" type="email" required onChange={manejarCambio} className={inputCSS} placeholder="usuario@correo.com" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCSS}>Contraseña</label>
                <input name="password" type="password" required onChange={manejarCambio} className={inputCSS} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelCSS}>Tipo de Cuenta</label>
                <select name="rol" onChange={manejarCambio} className={`${inputCSS} cursor-pointer`}>
                  <option value="Chofer">Chofer Conductor</option>
                  <option value="Cliente">Cliente Pasajero</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:-translate-y-1">
                Registrar Cuenta Segura
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              ¿Ya tienes una cuenta operativa?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}