# Eje Salud — Backend (FastAPI)

API REST para la clínica **Eje Salud**: especialidades (Médico general, Radiología, Psicología, Podología, Medicina integral), solicitudes de cita, mensajes de contacto, disponibilidad por franjas y panel administrativo con JWT.

## Requisitos

- Python 3.11+
- MySQL 8 (o compatible, ej. MariaDB 10.6+) con base de datos creada

## Configuración

Copie `.env.example` a `.env` y ajuste valores. Variables importantes:

- `DATABASE_URL`: cadena SQLAlchemy para **MySQL** con PyMySQL, por ejemplo  
  `mysql+pymysql://USUARIO:CONTRASENA@127.0.0.1:3306/eje_salud?charset=utf8mb4`  
  Si la contraseña tiene caracteres reservados (`@`, `:`, etc.), codifícala con `urllib.parse.quote_plus` antes de armar la URL.
- `JWT_SECRET_KEY`: secreto largo y aleatorio en producción.
- `FRONTEND_ORIGINS`: orígenes CORS separados por coma (ej. `http://localhost:5173`).
- `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`: si están definidos y no existe ningún administrador, se crea el primer usuario al arrancar (solo bootstrap controlado).

## Base de datos

En MySQL, cree la base (UTF-8):

```sql
CREATE DATABASE eje_salud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Otorgue permisos al usuario que usará en `DATABASE_URL`.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
```

Las especialidades por defecto se insertan automáticamente al **primer arranque** de la aplicación si la tabla está vacía.

Las pruebas (`pytest`) fuerzan **SQLite en archivo temporal** para no depender de un servidor MySQL en CI.

## Ejecutar

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentación interactiva: `http://localhost:8000/docs`

## Contrato API (resumen)

Prefijo: `/api/v1`

**Público**

- `GET /specialties`, `GET /specialties/{slug}`
- `GET /availability?slot_date=YYYY-MM-DD&specialty_slug=...`
- `POST /appointment-requests` — cuerpo incluye `specialty_slug`, datos del paciente y opcionalmente `availability_slot_id`
- `POST /contact-messages`

**Admin (cabecera `Authorization: Bearer <token>`)**

- `POST /auth/login` — JSON `{ "email", "password" }`
- `GET|PATCH /admin/appointment-requests`, `PATCH /admin/appointment-requests/{id}`
- `GET|POST|PATCH|DELETE /admin/specialties`
- `GET|POST|PATCH|DELETE /admin/availability-slots`
- `GET|PATCH /admin/contact-messages`

**Salud**

- `GET /health`

### Integración con el frontend

Si el proyecto ZIP del frontend no está en este workspace, apunte el cliente HTTP a `API_URL` (por ejemplo `http://localhost:8000/api/v1`) y use los endpoints anteriores. Campos JSON recomendados para citas: `patient_name`, `phone`, `email`, `specialty_slug`, `preferred_date`, `preferred_time`, `message`, `availability_slot_id` (opcional).

## Pruebas

```bash
pytest
```

## Producción

Use MySQL gestionado (o réplicas/backups acordes), secreto JWT fuerte, HTTPS delante de un proxy y **no** dependa de `ADMIN_BOOTSTRAP_*` salvo el primer despliegue; cree usuarios admin de forma controlada.
