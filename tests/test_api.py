from app.models.appointment import AppointmentStatus


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_list_specialties_seeded(client):
    r = client.get("/api/v1/specialties")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5
    slugs = {row["slug"] for row in data}
    assert slugs == {
        "medico-general",
        "radiologia",
        "psicologia",
        "podologia",
        "medicina-integral",
    }


def test_create_appointment_and_admin_flow(client):
    r = client.post(
        "/api/v1/appointment-requests",
        json={
            "patient_name": "María Pérez",
            "phone": "555-0101",
            "email": "maria@example.com",
            "specialty_slug": "medico-general",
            "preferred_date": "2030-01-15",
            "preferred_time": "09:30",
            "message": "Primera consulta",
        },
    )
    assert r.status_code == 201
    created = r.json()
    assert created["status"] == AppointmentStatus.pending.value
    appt_id = created["id"]

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.local", "password": "password12345678"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    listed = client.get("/api/v1/admin/appointment-requests", headers=headers)
    assert listed.status_code == 200
    assert any(row["id"] == appt_id for row in listed.json())

    patch = client.patch(
        f"/api/v1/admin/appointment-requests/{appt_id}",
        headers=headers,
        json={"status": AppointmentStatus.confirmed.value},
    )
    assert patch.status_code == 200
    assert patch.json()["status"] == AppointmentStatus.confirmed.value


def test_contact_message(client):
    r = client.post(
        "/api/v1/contact-messages",
        json={
            "name": "Carlos Gómez",
            "email": "carlos@example.com",
            "phone": "555-0202",
            "subject": "Información",
            "body": "Quisiera información sobre horarios.",
        },
    )
    assert r.status_code == 201
    msg_id = r.json()["id"]

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.local", "password": "password12345678"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    upd = client.patch(
        f"/api/v1/admin/contact-messages/{msg_id}",
        headers=headers,
        json={"is_read": True},
    )
    assert upd.status_code == 200
    assert upd.json()["is_read"] is True
