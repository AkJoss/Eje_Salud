# 🏥 Eje Salud — Backend API

Backend REST con Node.js + Express + MySQL para la clínica Eje Salud.

---

## Stack tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express
- **Base de datos:** MySQL 8
- **ORM:** Sequelize
- **Autenticación:** JWT + bcryptjs
- **Frontend:** HTML / CSS / Bootstrap (carpeta `public/`)

---

## Requisitos previos

- Node.js 18 o superior
- MySQL 8 corriendo (local con XAMPP, Laragon, o similar)
- npm

---

## Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/AkJoss/Eje_Salud
cd Eje_Salud

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
# Edita .env con tus credenciales locales

# 4. Crear la base de datos en MySQL
# Abre phpMyAdmin o tu cliente MySQL y ejecuta:
# CREATE DATABASE eje_salud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 5. Correr migraciones (crea las tablas)
npx sequelize-cli db:migrate

# 6. Correr seeders (inserta datos iniciales)
npx sequelize-cli db:seed:all

# 7. Iniciar el servidor
npm run dev
```

El servidor corre en **http://localhost:5000**

---

## Variables de entorno — `.env`

Crea un archivo `.env` en la raíz del proyecto con lo siguiente:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=eje_salud
DB_USER=root
DB_PASSWORD=

JWT_SECRET=genera_una_clave_segura_aqui
JWT_EXPIRES_IN=7d
PORT=5000
```

> Para generar un JWT_SECRET seguro corre:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## Credenciales iniciales (seeders)

Después de correr los seeders tendrás:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@ejesalud.com | admin123 |

> ⚠️ Cambia la contraseña del admin antes de subir a producción.

---

## Estructura del proyecto

```
Eje_Salud/
├── src/
│   ├── config/
│   │   └── database.js         # Conexión MySQL con Sequelize
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── medicoController.js
│   │   └── citaController.js
│   ├── middlewares/
│   │   └── auth.js             # JWT + roles
│   ├── models/
│   │   ├── index.js            # Relaciones entre modelos
│   │   ├── User.js
│   │   ├── Medico.js
│   │   ├── Horario.js
│   │   ├── Cita.js
│   │   └── Especialidad.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── medicos.js
│   │   └── citas.js
│   └── index.js                # Servidor principal
├── migrations/                 # Estructura de tablas
│   ├── 20260001-create-users.js
│   ├── 20260002-create-especialidades.js
│   ├── 20260003-create-medicos.js
│   ├── 20260004-create-horarios.js
│   └── 20260005-create-citas.js
├── seeders/                    # Datos iniciales
│   ├── 20260001-especialidades.js
│   ├── 20260002-admin.js
│   └── 20260003-medicos.js
├── public/                     # Frontend estático
│   ├── index.html
│   ├── login.html
│   ├── registro.html
│   ├── consultation.html
│   ├── mis-citas.html
│   └── assets/
│       ├── css/
│       ├── js/
│       │   ├── api.js          # Cliente HTTP + Auth helpers
│       │   └── script.js
│       └── images/
├── config/
│   └── config.json             # Configuración Sequelize CLI
├── .env.example
├── .gitignore
└── package.json
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

## Especialidades disponibles

- Médico General
- Medicina Interna
- Psicología
- Podología
- Radiología

---

## Ejemplo: agendar una cita (POST /api/citas)

```json
// Headers: Authorization: Bearer <token>
{
  "medico": 1,
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
    "id": 1,
    "especialidad": "Psicología",
    "fecha": "2026-05-20",
    "hora": "10:00",
    "estado": "pendiente"
  }
}
```

---

## Producción

El proyecto está desplegado en:
- **Frontend + Backend:** https://ejesalud.com.mx
- **Hosting:** cPanel con Node.js App
- **Base de datos:** MySQL en cPanel

> Para desplegar cambios: sube los archivos modificados via File Manager de cPanel y reinicia la app en Setup Node.js App.

---

## Notas importantes

- El archivo `.env` **nunca** se sube a GitHub
- Los IDs usan `id` (entero), no `_id` como en MongoDB
- El servidor usa `sequelize.sync()` sin `alter: true` para evitar índices duplicados