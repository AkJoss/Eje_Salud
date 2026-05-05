# 🏥 Eje Salud — Frontend Progress README

> **Propósito de este documento:** Dar contexto completo a cualquier IA o desarrollador que continúe este proyecto. Resume el estado actual, decisiones tomadas, arquitectura y los pasos pendientes.

---

## 📌 Contexto General

**Eje Salud** es una clínica médica con un backend REST ya funcional (Node.js + Express + MongoDB). Se está construyendo un frontend en **HTML/JS puro** que se conecta a ese backend via `fetch()`.

El frontend usa como base visual una **plantilla HTML comprada llamada Grace Glow** (clínica estética), que se está adaptando al nombre, colores y contenido de Eje Salud.

---

## 🗂️ Estructura del Proyecto

La decisión fue usar la **Opción B**: frontend dentro del mismo repo del backend, servido como archivos estáticos por Express.

```
eje-salud-backend/
├── src/                          # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js           # Conexión MongoDB
│   ├── controllers/
│   │   ├── authController.js     # Login, registro, perfil
│   │   ├── medicoController.js   # CRUD médicos
│   │   └── citaController.js     # CRUD citas + disponibilidad
│   ├── middlewares/
│   │   └── auth.js               # JWT + control de roles
│   ├── models/
│   │   ├── User.js               # Pacientes y admins
│   │   ├── Medico.js             # Médicos + horarios
│   │   └── Cita.js               # Citas médicas
│   ├── routes/
│   │   ├── auth.js
│   │   ├── medicos.js
│   │   └── citas.js
│   └── index.js                  # ⚠️ MODIFICADO — ver cambios abajo
│
├── public/                       # ✅ NUEVA — Frontend aquí
│   ├── assets/
│   │   ├── css/                  # De la plantilla (sin modificar)
│   │   │   ├── style.css
│   │   │   ├── bootstrap.min.css
│   │   │   └── aos.css
│   │   ├── js/
│   │   │   ├── api.js            # ✅ NUEVO — capa central de API
│   │   │   ├── script.js         # De la plantilla (sin modificar)
│   │   │   ├── bootstrap.bundle.min.js
│   │   │   └── aos.js
│   │   └── images/               # De la plantilla (sin modificar)
│   ├── index.html                # De la plantilla (pendiente adaptar)
│   ├── consultation.html         # De la plantilla (pendiente adaptar)
│   ├── login.html                # ✅ NUEVO
│   ├── registro.html             # ✅ NUEVO
│   ├── mis-citas.html            # ✅ NUEVO
│   └── ...resto de la plantilla  # Sin modificar aún
│
├── package.json
└── .env
```

---

## ⚙️ Cambio en `src/index.js`

Se agregaron **3 líneas** al archivo original para que Express sirva el frontend:

```javascript
const path = require('path');  // línea nueva

// Después de los middlewares globales:
app.use(express.static(path.join(__dirname, '../public')));  // línea nueva

// La ruta raíz GET '/' ya no devuelve JSON, ahora sirve el HTML:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));  // línea modificada
});
```

> ⚠️ Sin este cambio, el frontend no funciona. Debe aplicarse antes de probar cualquier página.

---

## 🔌 API del Backend

Base URL local: `http://localhost:5000/api`

### Auth — `/api/auth`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/registro` | Público | Registrar paciente |
| POST | `/login` | Público | Iniciar sesión |
| GET | `/perfil` | Autenticado | Ver mi perfil |

**Respuesta de `/login` y `/registro`:**
```json
{
  "ok": true,
  "token": "eyJ...",
  "usuario": {
    "id": "...",
    "nombre": "...",
    "apellido": "...",
    "email": "...",
    "rol": "paciente"
  }
}
```

### Médicos — `/api/medicos`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Público | Listar médicos (filtro: `?especialidad=Psicología`) |
| GET | `/:id` | Público | Ver un médico |
| GET | `/especialidades` | Público | Ver especialidades |
| POST | `/` | Admin | Crear médico |
| PUT | `/:id` | Admin | Actualizar médico |
| DELETE | `/:id` | Admin | Desactivar médico (soft delete) |

**Campos del modelo Medico:**
`nombre`, `apellido`, `especialidad`, `cedula`, `email`, `telefono`, `bio`, `foto`, `horarios[]`, `activo`

### Citas — `/api/citas`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Autenticado | Mis citas (admin ve todas) |
| GET | `/:id` | Autenticado | Ver una cita |
| GET | `/disponibilidad?medicoId=&fecha=` | Autenticado | Horas disponibles |
| POST | `/` | Paciente | Agendar cita |
| PUT | `/:id/estado` | Admin | Cambiar estado |
| DELETE | `/:id` | Autenticado | Cancelar cita |

**Campos requeridos para agendar (POST /api/citas):**
```json
{
  "medico": "ObjectId del médico",
  "especialidad": "Psicología",
  "fecha": "2026-05-20",
  "hora": "10:00",
  "motivo": "Texto del motivo"
}
```

**Estados posibles de una cita:** `pendiente` | `confirmada` | `cancelada` | `completada`

**Disponibilidad:** Horario 8:00am–6:00pm, intervalos de 30 minutos.

---

## 🏷️ Especialidades (definitivas, hardcoded en el backend)

```
Médico General
Medicina Interna
Psicología
Podología
Radiología
```

> ⚠️ Estos valores son enums en `Cita.js` y `Medico.js`. El frontend debe usar exactamente estos strings.

---

## 👤 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| `paciente` | Ver sus citas, agendar, cancelar las propias |
| `admin` | Ver todas las citas, cambiar estados, CRUD médicos |

El rol se determina en el token JWT. El frontend lo lee de `localStorage` con `Auth.getUsuario().rol`.

---

## 📁 Archivos Nuevos del Frontend

### `public/assets/js/api.js` ✅ Completo

Capa central de comunicación con el backend. Exporta estos objetos globales:

| Objeto | Qué hace |
|--------|----------|
| `Auth` | Maneja JWT en localStorage: `getToken()`, `getUsuario()`, `setSession()`, `clearSession()`, `isLoggedIn()`, `isAdmin()` |
| `AuthAPI` | `login(email, pass)`, `registro(campos)`, `perfil()`, `logout()` |
| `MedicosAPI` | `listar(especialidad?)`, `obtener(id)`, `especialidades()` |
| `CitasAPI` | `listar()`, `obtener(id)`, `disponibilidad(medicoId, fecha)`, `agendar({...})`, `cancelar(id)`, `cambiarEstado(id, estado)` |
| `UI` | `requireAuth()`, `requireAdmin()`, `showError(id, msg)`, `hideError(id)`, `updateNavbar()` |

> `updateNavbar()` se ejecuta automáticamente en cada página via `DOMContentLoaded`.

### `public/login.html` ✅ Completo

- Formulario: email + contraseña
- Toggle mostrar/ocultar contraseña
- Spinner en botón durante el fetch
- Manejo de errores del backend
- Si ya está logueado → redirige a `mis-citas.html`
- Enter para enviar

### `public/registro.html` ✅ Completo

- Campos: nombre, apellido, teléfono, fecha de nacimiento, email, contraseña, confirmar contraseña
- Validaciones frontend (campos vacíos, mínimo 6 chars, contraseñas coinciden)
- Mensaje de éxito + redirección automática a `mis-citas.html` tras 1.5s
- Si ya está logueado → redirige a `mis-citas.html`

### `public/mis-citas.html` ✅ Completo

- Protección de ruta: redirige a `login.html` si no hay sesión
- Skeletons animados mientras carga
- Stats en la parte superior (total, pendientes, confirmadas, completadas)
- Filtros por estado
- Tarjeta por cita con: especialidad + ícono, fecha en español, hora, médico asignado, motivo
- Botón cancelar solo en citas `pendiente` o `confirmada`
- Modal de confirmación antes de cancelar
- Si el usuario es `admin`: título cambia a "Todas las Citas" y ve las de todos los pacientes

---

## 🔲 Pendiente

| Página | Descripción |
|--------|-------------|
| `public/consultation.html` | Formulario de agendar cita: seleccionar especialidad → médico → fecha → hora disponible → motivo → POST /api/citas |
| `public/index.html` | Adaptar plantilla con nombre "Eje Salud", especialidades correctas y médicos dinámicos desde GET /api/medicos |

---

## 🎨 Estilo Visual

La plantilla base es **Grace Glow** (HTML5 + Bootstrap 5 + AOS + Font Awesome).

Colores principales (definidos en `assets/css/style.css`):
```css
--primary-color: #c58aa0;
--secondary-color: #a36a7b;
--dark-color: #2b2b2b;
--light-color: #f9f9f9;
```

Fuentes: `Playfair Display` (títulos) + `Montserrat` (cuerpo)

Los archivos nuevos (`login.html`, `registro.html`, `mis-citas.html`) replican exactamente estos estilos con CSS inline adicional para sus secciones específicas.

---

## 🚀 Cómo correr el proyecto localmente

```bash
# 1. Instalar dependencias del backend
cd eje-salud-backend
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu URI de MongoDB y JWT_SECRET

# 3. Iniciar servidor
npm run dev

# 4. Abrir en el navegador
# http://localhost:5000  → index.html
# http://localhost:5000/login.html
# http://localhost:5000/registro.html
# http://localhost:5000/mis-citas.html
```

> No se necesita ningún bundler ni build step. Es HTML/JS puro servido por Express.

---

## 📋 Reglas importantes para continuar

1. **Siempre incluir `api.js`** al final del `<body>` en cada página nueva, antes del script de la página.
2. **El navbar** debe incluir los elementos con IDs: `nav-login`, `nav-usuario`, `nav-nombre`, `nav-mis-citas`, `nav-logout` para que `UI.updateNavbar()` funcione correctamente.
3. **Las especialidades** deben usar exactamente los strings del enum del backend.
4. **Páginas protegidas** deben llamar `UI.requireAuth()` al inicio del script.
5. **El token JWT** se guarda en `localStorage` con la clave `token`. El usuario en `localStorage` con la clave `usuario` (JSON).