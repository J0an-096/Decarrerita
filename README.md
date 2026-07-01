# Decarrerita - Sistema de Gestión de Transporte

## 📌 Descripción del Proyecto
Decarrerita es un sistema web transaccional diseñado para automatizar y gestionar la logística de una empresa de transporte de pasajeros con flota liviana en Ciudad Guayana. La plataforma actúa como intermediaria, controlando el ciclo de vida del servicio, validando la operatividad de los choferes mediante pruebas anuales y gestionando el flujo financiero automatizado.

## 🏗️ Arquitectura y Stack Tecnológico
El proyecto opera bajo una arquitectura Monorepo dividida en un entorno Backend (motor transaccional) y Frontend (interfaz de usuario).

### Backend (Servidor)
* **Lenguaje:** Node.js implementando TypeScript para tipado estricto.
* **Base de Datos:** PostgreSQL.
* **ORM:** Prisma (Mapeo relacional y ejecución de consultas).
* **Seguridad:** Encriptación de contraseñas (bcrypt) y Control de Acceso Basado en Roles (RBAC) mediante JSON Web Tokens (JWT).

### Frontend (Cliente)
* **Framework Base:** React con Vite y TypeScript.
* **Enrutamiento:** React Router DOM (Single Page Application).
* **Estilos y UI:** Tailwind CSS v4.
* **Peticiones HTTP:** Axios.
* **Geolocalización:** Leaflet + OpenStreetMap (`react-leaflet`) para trazar rutas y calcular distancias.
* **Alertas Visuales:** SweetAlert2.

## 👥 Control de Roles y Accesos (RBAC)
El sistema restringe las operaciones de la base de datos basándose en cuatro perfiles estructurados:
1.  **Cliente:** Gestiona su billetera virtual (recarga de saldo) y solicita traslados mediante el mapa interactivo.
2.  **Chofer:** Ejecuta los viajes asignados y controla su disponibilidad en tiempo real.
3.  **Personal Administrativo:** Audita y registra las evaluaciones (psicológicas y vehiculares) y emite los pagos de deudas a los choferes.
4.  **Administrador:** Control y supervisión de alto nivel.

---

## 🚀 Manual de Integración (Frontend ↔ Backend)

**ATENCIÓN EQUIPO DE DESARROLLO FRONTEND:**
El servidor local responde en `http://localhost:3000`. Su responsabilidad es enviar los datos desde React cumpliendo este contrato estricto:

1.  **Nomenclatura (camelCase):** El backend exige que los nombres de las variables en el cuerpo de la petición (JSON) sean exactos (ej. `distanciaKm`, `nombreCompleto`). Un error tipográfico resultará en un fallo de inserción.
2.  **Autenticación Obligatoria:** Todas las rutas operativas están protegidas. Deben extraer el Token del contexto de seguridad e inyectarlo en Axios mediante la cabecera `Authorization: Bearer <token>`.
3.  **Sanitización de Datos:** Los formularios deben limpiar los datos antes de enviarlos. La cédula debe ir formateada obligatoriamente como `V-XXXXXXXX`.
4.  **Design System:** Para mantener la coherencia visual en todos los módulos, deben utilizar obligatoriamente las clases globales en sus componentes: `className="input-decarrerita"`, `className="label-decarrerita"`, `className="btn-primario"`.

---

## 💻 Manual de Instalación y Ejecución (A prueba de fallos)

Sigan estos pasos estrictamente en orden para levantar el proyecto localmente.
*Requisito previo: Deben tener instalado Node.js y PostgreSQL en sus equipos.*

### Paso 1: Clonar el Repositorio
Abre tu terminal y ejecuta:

git clone <URL_DEL_REPOSITORIO>
cd Decarrerita

### Paso 2: Configurar y Levantar el Backend
##### Abre una terminal y entra a la carpeta del servidor:

cd backend

##### Instala las dependencias:

npm install

##### Crea un archivo llamado .env en la raíz de la carpeta backend y llenalo con lo siguietne para conectarte a tu motor local:

DATABASE_URL="postgresql://<TU_USUARIO>:<TU_CONTRASEÑA>@localhost:5432/decarrerita_db?schema=public"
JWT_SECRET="ingresa_tu_clave_secreta_aqui"

##### Sincroniza el modelo con tu base de datos mediante Prisma:

npx prisma migrate dev

##### Enciende el servidor backend:

npm run dev

###### (Mantén esta terminal abierta. Si la cierras, la base de datos dejará de responder).

### Paso 3: Configurar y Levantar el Frontend
##### Abre una NUEVA terminal (sin cerrar la del backend) y entra a la interfaz:

cd frontend

##### Instala las dependencias de React:

npm install

##### Enciende el entorno visual:

npm run dev

##### Haz Ctrl + Clic en el enlace que aparece en la terminal (usualmente `http://localhost:5173`) para abrir la aplicación.
