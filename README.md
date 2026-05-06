# 🏥 Eje Salud — Backend API

Backend REST con Node.js + Express + MongoDB para la clínica Eje Salud.

> ⚠️ **Pendiente de migración:** la base de datos actual es MongoDB. Se requiere migrar a SQL (MySQL o PostgreSQL). Ver sección [Migración a SQL](#-migración-a-sql-pendiente) al final de este documento.

---

## Requisitos
- Node.js 18+
- MongoDB local o Atlas *(actual — a reemplazar por SQL)*

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
│   │   │   └── database.js         # Conexión MongoDB → reemplazar por SQL
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

---

## 🔄 Migración a SQL (pendiente)

La base de datos actual usa **MongoDB con Mongoose**. Se requiere migrar a una base de datos relacional SQL (se recomienda **MySQL 8** o **PostgreSQL 15+**).

### Contexto actual

| Elemento | Estado actual |
|----------|--------------|
| Base de datos | MongoDB (local o Atlas) |
| ODM | Mongoose |
| Conexión | `src/config/database.js` vía `MONGODB_URI` |
| Modelos | `User.js`, `Medico.js`, `Cita.js` en `src/models/` |

Los modelos actuales de Mongoose definen documentos sin relaciones explícitas (referencias por `ObjectId`). Al migrar a SQL, estas referencias pasan a ser llaves foráneas en tablas relacionadas.

### Esquema relacional propuesto

A continuación se muestra la estructura equivalente en SQL para los tres modelos existentes:

```sql
-- Usuarios (pacientes y admins)
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,        -- hash bcrypt
  rol         ENUM('paciente', 'admin') NOT NULL DEFAULT 'paciente',
  telefono    VARCHAR(20),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Médicos
CREATE TABLE medicos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  especialidad  VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE,
  telefono      VARCHAR(20),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Horarios disponibles de cada médico
CREATE TABLE horarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  medico_id   INT NOT NULL,
  dia_semana  TINYINT NOT NULL,   -- 0=lunes … 6=domingo
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE
);

-- Citas médicas
CREATE TABLE citas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id   INT NOT NULL,
  medico_id     INT NOT NULL,
  especialidad  VARCHAR(100) NOT NULL,
  fecha         DATE NOT NULL,
  hora          TIME NOT NULL,
  motivo        TEXT,
  estado        ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES users(id),
  FOREIGN KEY (medico_id)   REFERENCES medicos(id)
);
```

### Pasos requeridos para la migración

1. **Instalar dependencias SQL.** Reemplazar `mongoose` por un ORM o driver SQL. Opciones recomendadas:
   - **Sequelize** (`npm install sequelize mysql2`) — ORM similar a Mongoose, menor fricción de migración.
   - **Prisma** (`npm install prisma @prisma/client`) — esquema declarativo y migraciones integradas.
   - **mysql2** directo si se prefiere SQL puro sin ORM.

2. **Actualizar `src/config/database.js`.** Reemplazar la conexión Mongoose por la conexión SQL correspondiente al ORM elegido.

3. **Reescribir los modelos** (`User.js`, `Medico.js`, `Cita.js`) como modelos Sequelize/Prisma o como clases que usen consultas SQL directas. El esquema propuesto arriba es la referencia.

4. **Actualizar los controllers.** Reemplazar métodos Mongoose (`find`, `findById`, `save`, etc.) por las consultas SQL equivalentes. Los endpoints y su lógica de negocio no cambian.

5. **Actualizar variables de entorno.** Reemplazar `MONGODB_URI` por las variables de conexión SQL:

```env
# Reemplazar esto:
MONGODB_URI=mongodb://localhost:27017/eje-salud

# Por esto (ejemplo MySQL):
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=eje_salud
DB_USER=usuario
DB_PASSWORD=contraseña

JWT_SECRET=clave_super_secreta
JWT_EXPIRES_IN=7d
PORT=5000
```

6. **Crear la base de datos** en el servidor SQL antes de arrancar:

```sql
CREATE DATABASE eje_salud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

7. **Ejecutar migraciones** para crear las tablas (con Sequelize: `sequelize db:migrate`; con Prisma: `prisma migrate dev`).

8. **Actualizar `.env.example`** con las nuevas variables para que otros desarrolladores puedan configurar su entorno.

### Seeders necesarios

Al migrar a SQL, dos conjuntos de datos iniciales deben insertarse con seeders antes de que la aplicación funcione correctamente:

**1. Usuario admin**

En MongoDB se creó manualmente desde mongosh. En SQL esto debe automatizarse para que cualquier desarrollador pueda levantar el proyecto sin pasos manuales. Con Sequelize crea `seeders/20240001-admin.js`:

```js
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('users', [{
      nombre:     'Admin',
      email:      'admin@ejesalud.com',
      password:   await bcrypt.hash('admin123', 10),
      rol:        'admin',
      created_at: new Date()
    }]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', { email: 'admin@ejesalud.com' });
  }
};
```

**2. Especialidades**

Las especialidades actualmente están hardcodeadas en el frontend y en los controllers. En SQL deben tener su propia tabla y seeder. Con Sequelize crea `seeders/20240002-especialidades.js`:

```js
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('especialidades', [
      { nombre: 'Médico General',   created_at: new Date() },
      { nombre: 'Medicina Interna', created_at: new Date() },
      { nombre: 'Psicología',       created_at: new Date() },
      { nombre: 'Podología',        created_at: new Date() },
      { nombre: 'Radiología',       created_at: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('especialidades', null, {});
  }
};
```

Para correr los seeders después de las migraciones:

```bash
sequelize db:seed:all
```

> **Nota:** Cambia la contraseña del admin antes de subir a producción. El seeder es solo para desarrollo y CI.

### Lo que NO cambia

- Todos los endpoints (`/api/auth`, `/api/medicos`, `/api/citas`) y sus rutas.
- La lógica de autenticación JWT (`src/middlewares/auth.js`).
- El frontend — consume los mismos endpoints y espera las mismas respuestas JSON.
- Los campos en las respuestas JSON (pueden mantenerse idénticos; solo cambia `_id` → `id`).

> **Nota sobre `_id` → `id`:** MongoDB usa `_id` (string hex) como identificador; SQL usa `id` (entero). Si el frontend o los controllers referencian `_id`, deben actualizarse a `id` en todos los puntos donde se construya o consuma el JSON.