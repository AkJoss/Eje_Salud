# 🏥 Eje Salud — Sistema de Citas Médicas

Sistema completo de gestión de citas para el **Hospital Eje Central**.  
**Backend:** Node.js + Express + MongoDB + JWT  
**Frontend:** HTML/CSS/JS puro + Bootstrap 5 (rama `frontend-ejsalud`)

---

## 🗂 Ramas del repositorio

| Rama | Contenido |
|------|-----------|
| `main` | Backend (Node.js + Express + MongoDB) |
| `frontend-ejsalud` | Frontend (HTML/CSS/JS) |

---

## ⚙️ Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [MongoDB Community](https://www.mongodb.com/try/download/community) corriendo en `localhost:27017`
- npm v9 o superior

---

## 🚀 Instalación completa (Backend + Frontend)

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/AkJoss/Eje_Salud.git
cd Eje_Salud
```

### Paso 2 — Configurar el backend

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
```

Editar el `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/eje-salud
JWT_SECRET=pon_aqui_una_clave_secreta_larga
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Paso 3 — Poblar médicos de prueba (solo la primera vez)

```bash
node src/seedMedicos.js
```

Inserta 5 médicos con distintas especialidades en la base de datos.

### Paso 4 — Iniciar el servidor backend

```bash
# Modo desarrollo (con nodemon)
npm run dev
```

El backend queda en: `http://localhost:3001`

### Paso 5 — Levantar el frontend

```bash
# Cambiar a la rama del frontend
git checkout frontend-ejsalud

# Levantar servidor estático en la carpeta del proyecto
python3 -m http.server 5500
# o con Node.js:
npx serve . -p 5500
```

Abrir en el navegador: `http://localhost:5500`

> ⚠️ **Importante:** El backend debe estar corriendo **antes** de usar el frontend.

---

## 🧪 Flujo de prueba

1. Abre `http://localhost:5500/registro.html` → Crea una cuenta de paciente
2. Ve a `http://localhost:5500/login.html` → Inicia sesión
3. En el dashboard → Haz clic en **Agendar Cita**
4. Selecciona especialidad → médico → fecha → hora → Confirmar
5. En **Mis Citas** puedes mover o cancelar la cita

---

## 📝 Notas para el equipo

- **No subas tu `.env`** al repositorio (ya está en `.gitignore`)
- El frontend está en la rama **`frontend-ejsalud`**
- El backend está en la rama **`main`**
- Para contribuir, crea una rama propia: `git checkout -b feature/tu-nombre`

---

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
eje-salud-backend/
├── src/
│   ├── config/
│   │   └── database.js       # Conexión MongoDB
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── medicoController.js
│   │   └── citaController.js
│   ├── middlewares/
│   │   └── auth.js           # JWT + roles
│   ├── models/
│   │   ├── User.js           # Pacientes y admins
│   │   ├── Medico.js         # Médicos + horarios
│   │   └── Cita.js           # Citas médicas
│   ├── routes/
│   │   ├── auth.js
│   │   ├── medicos.js
│   │   └── citas.js
│   └── index.js              # Servidor principal
├── .env.example
├── package.json
└── README.md
```

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
    "estado": "pendiente",
    ...
  }
}
```