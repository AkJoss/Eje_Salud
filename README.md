# 🏥 Eje Salud — Backend API

Backend REST con Node.js + Express + MongoDB para la clínica Eje Salud.

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
```

---

## Endpoints

### Auth — `/api/auth`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/registro` | Público | Registrar paciente |
| POST | `/login` | Público | Iniciar sesión |
| GET | `/perfil` | Autenticado | Ver mi perfil |

### Médicos — `/api/medicos`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Público | Listar médicos (filtro: `?especialidad=Psicología`) |
| GET | `/:id` | Público | Ver un médico |
| GET | `/especialidades` | Público | Ver especialidades disponibles |
| POST | `/` | Admin | Crear médico |
| PUT | `/:id` | Admin | Actualizar médico |
| DELETE | `/:id` | Admin | Desactivar médico |

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

## Especialidades registradas
- Médico General
- Medicina Interna
- Psicología
- Podología
- Radiología

---

## Estructura del proyecto
```
eje-salud/
│
├── backend/                        # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Conexión MongoDB
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── medicoController.js
│   │   │   └── citaController.js
│   │   ├── middlewares/
│   │   │   └── auth.js             # JWT + roles
│   │   ├── models/
│   │   │   ├── User.js             # Pacientes y admins
│   │   │   ├── Medico.js           # Médicos + horarios
│   │   │   └── Cita.js             # Citas médicas
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── medicos.js
│   │   │   └── citas.js
│   │   └── index.js                # Servidor principal
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── frontend/                       # Sitio web estático
    ├── index.html                  # Página principal
    ├── login.html                  # Iniciar sesión
    ├── registro.html               # Registro de paciente
    ├── consultation.html           # Agendar cita
    ├── mis-citas.html              # Panel del paciente
    └── assets/
        ├── css/
        │   ├── bootstrap.min.css
        │   ├── aos.css
        │   └── style.css           # Estilos personalizados
        ├── js/
        │   ├── bootstrap.bundle.min.js
        │   ├── aos.js
        │   ├── script.js           # Lógica general del sitio
        │   └── api.js              # Cliente HTTP + Auth helpers
        └── images/
```

---

## Variables de entorno — `.env`
```
MONGODB_URI=mongodb://localhost:27017/eje-salud
JWT_SECRET=clave_super_secreta
JWT_EXPIRES_IN=7d
PORT=5000
```

> El servidor corre en **http://localhost:5000**

---

## Ejemplo: agendar una cita (POST /api/citas)

```json
// Headers: Authorization: Bearer <token>
{
  "medico": "64abc123...",
  "especialidad": "Psicología",
  "fecha": "2026-05-20",
  "hora": "10:00",
  "motivo": "Primera consulta por ansiedad generalizada"
}
```

Respuesta:
```json
{
  "ok": true,
  "mensaje": "Cita agendada exitosamente.",
  "cita": {
    "_id": "...",
    "especialidad": "Psicología",
    "fecha": "2026-05-20T00:00:00.000Z",
    "hora": "10:00",
    "estado": "pendiente"
  }
}
```