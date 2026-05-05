# 🏥 Eje Salud — Documentación del Proyecto

Backend REST con Node.js + Express + MongoDB + Frontend HTML/JS integrado.

---

## Requisitos

- Node.js 18+
- MongoDB local o Atlas

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Edita .env con tu URI de MongoDB y un JWT_SECRET seguro

# 3. Iniciar en desarrollo
npm run dev

# 4. Iniciar en producción
npm start
```

El servidor corre en `http://localhost:5000` y sirve tanto la API como el frontend.

---

## Estructura del Proyecto

```
eje-salud-backend/
├── src/
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
│   └── index.js                  # Servidor principal + express.static
│
├── public/                       # Frontend (HTML/JS puro)
│   ├── assets/
│   │   ├── css/                  # Bootstrap, AOS, style.css
│   │   ├── js/
│   │   │   ├── api.js            # Capa central de fetch + JWT
│   │   │   └── ...               # Bootstrap, AOS, script.js
│   │   └── images/
│   ├── index.html                # Landing page
│   ├── login.html                # Iniciar sesión
│   ├── registro.html             # Crear cuenta
│   ├── consultation.html         # Agendar cita (4 pasos)
│   └── mis-citas.html            # Ver y cancelar citas
│
├── .env.example
├── package.json
└── README.md
```

---

## Endpoints del API

Base URL: `http://localhost:5000/api`

### Auth — `/api/auth`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/registro` | Público | Registrar paciente |
| POST | `/login` | Público | Iniciar sesión |
| GET | `/perfil` | Autenticado | Ver mi perfil |

### Médicos — `/api/medicos`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Público | Listar médicos activos (filtro: `?especialidad=Psicología`) |
| GET | `/:id` | Público | Ver un médico |
| GET | `/especialidades` | Público | Ver especialidades disponibles |
| POST | `/` | Admin | Crear médico |
| PUT | `/:id` | Admin | Actualizar médico |
| DELETE | `/:id` | Admin | Desactivar médico (soft delete) |

### Citas — `/api/citas`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Autenticado | Mis citas (admin ve todas) |
| GET | `/:id` | Autenticado | Ver una cita |
| GET | `/disponibilidad?medicoId=&fecha=` | Autenticado | Horas disponibles |
| POST | `/` | Paciente | Agendar cita |
| PUT | `/:id/estado` | Admin | Cambiar estado |
| DELETE | `/:id` | Autenticado | Cancelar cita |

---

## Colecciones en MongoDB

### `users` — Pacientes y administradores

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `nombre` | String | ✅ | |
| `apellido` | String | ✅ | |
| `email` | String | ✅ | Único, lowercase |
| `telefono` | String | ✅ | |
| `fechaNacimiento` | Date | ❌ | Opcional |
| `password` | String | ✅ | Hasheado con bcrypt, mínimo 6 chars |
| `rol` | String | — | `paciente` (default) o `admin` |
| `activo` | Boolean | — | `true` por defecto |

**Crear un usuario admin manualmente desde MongoDB:**
```js
db.users.updateOne({ email: "admin@ejesalud.mx" }, { $set: { rol: "admin" } })
```

---

### `medicos` — Médicos registrados

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `nombre` | String | ✅ | |
| `apellido` | String | ✅ | |
| `especialidad` | String | ✅ | Ver especialidades válidas abajo |
| `cedula` | String | ✅ | Única |
| `email` | String | ✅ | Único |
| `telefono` | String | ❌ | |
| `bio` | String | ❌ | Máx 500 chars |
| `foto` | String | ❌ | URL externa de imagen |
| `horarios` | Array | ❌ | Ver esquema abajo |
| `activo` | Boolean | — | `true` por defecto |

**Esquema de horario:**
```json
{
  "dia": "lunes",
  "horaInicio": "09:00",
  "horaFin": "17:00"
}
```
Días válidos: `lunes`, `martes`, `miércoles`, `jueves`, `viernes`, `sábado`

**Especialidades válidas (enum):**
```
Médico General
Medicina Interna
Psicología
Podología
Radiología
```

**Ejemplo de registro de médico via POST `/api/medicos`:**
```json
{
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "especialidad": "Psicología",
  "cedula": "12345678",
  "email": "c.ramirez@ejesalud.mx",
  "telefono": "5512345678",
  "bio": "Especialista en ansiedad y terapia cognitivo-conductual con 10 años de experiencia.",
  "foto": "https://ejemplo.com/foto.jpg",
  "horarios": [
    { "dia": "lunes", "horaInicio": "09:00", "horaFin": "17:00" },
    { "dia": "miércoles", "horaInicio": "09:00", "horaFin": "17:00" },
    { "dia": "viernes", "horaInicio": "09:00", "horaFin": "14:00" }
  ]
}
```

> 💡 Se recomienda tener al menos 1 médico registrado por cada especialidad para que el formulario de agendar cita funcione correctamente en todas las áreas.

---

### `citas` — Citas médicas

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `paciente` | ObjectId | ✅ | Ref a `users` |
| `medico` | ObjectId | ✅ | Ref a `medicos` |
| `especialidad` | String | ✅ | Debe coincidir con la del médico |
| `fecha` | Date | ✅ | |
| `hora` | String | ✅ | Formato `"HH:MM"` ej: `"10:30"` |
| `motivo` | String | ✅ | Máx 500 chars |
| `estado` | String | — | `pendiente` (default) |
| `notas` | String | ❌ | Notas del médico post-consulta, máx 1000 chars |

**Estados válidos:** `pendiente` → `confirmada` → `completada` / `cancelada`

**Disponibilidad:** Horario de clínica 8:00–18:00, intervalos de 30 minutos. El sistema bloquea horas ya ocupadas por el mismo médico en la misma fecha.

---

## Roles y Permisos

| Rol | Acceso |
|-----|--------|
| `paciente` | Ver sus citas, agendar, cancelar las propias |
| `admin` | Todo lo anterior + ver todas las citas, cambiar estados, CRUD médicos |

El rol se asigna como `paciente` por defecto al registrarse. Para crear un admin hay que actualizarlo directamente en la base de datos (ver sección `users` arriba).

---

## Páginas del Frontend

| Página | URL | Acceso | Descripción |
|--------|-----|--------|-------------|
| `index.html` | `/` | Público | Landing page |
| `login.html` | `/login.html` | Público | Iniciar sesión |
| `registro.html` | `/registro.html` | Público | Crear cuenta |
| `consultation.html` | `/consultation.html` | Público* | Agendar cita en 4 pasos |
| `mis-citas.html` | `/mis-citas.html` | Autenticado | Ver y cancelar citas |

> *`consultation.html` es visible sin sesión pero muestra aviso al intentar agendar.

---

## Datos de Prueba Recomendados

Para probar el sistema completo se recomienda tener en la base de datos:

**1 usuario admin** (creado via registro normal, luego actualizar rol en MongoDB):
```json
{
  "nombre": "Admin",
  "apellido": "Eje Salud",
  "email": "admin@ejesalud.mx",
  "telefono": "5500000000",
  "password": "admin123"
}
```

**5 médicos (uno por especialidad):**
- Dr. Juan López — Médico General
- Dra. Ana Torres — Medicina Interna
- Dr. Carlos Ramírez — Psicología
- Dra. Laura Mendez — Podología
- Dr. Pedro Solis — Radiología

> Los médicos se crean via `POST /api/medicos` con un token de admin en el header: `Authorization: Bearer <token>`