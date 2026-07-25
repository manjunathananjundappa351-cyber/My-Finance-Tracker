def test_creating_expense_logs_activity(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 250,
            "description": "Groceries",
            "expense_date": "2026-07-01",
        },
    )

    response = client.get("/api/activity", headers=auth_headers)
    assert response.status_code == 200
    entries = response.json()
    assert len(entries) == 1
    assert entries[0]["action"] == "create"
    assert entries[0]["entity_type"] == "expense"
    assert "Groceries" in entries[0]["summary"]


def test_archive_and_delete_are_logged_in_order(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    created = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 100,
            "description": "Coffee",
            "expense_date": "2026-07-01",
        },
    ).json()

    client.post(f"/api/expenses/{created['id']}/archive", headers=auth_headers)
    client.delete(f"/api/expenses/{created['id']}", headers=auth_headers)

    entries = client.get("/api/activity", headers=auth_headers).json()
    actions = [e["action"] for e in entries]
    # most recent first
    assert actions == ["delete", "archive", "create"]


def test_activity_is_scoped_to_owner(client):
    client.post(
        "/api/auth/register",
        json={"email": "owner2@example.com", "password": "password123", "full_name": "Owner"},
    )
    owner_token = client.post(
        "/api/auth/login", json={"email": "owner2@example.com", "password": "password123"}
    ).json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    category_id = client.get("/api/expenses/categories", headers=owner_headers).json()[0]["id"]
    client.post(
        "/api/expenses",
        headers=owner_headers,
        json={
            "category_id": category_id,
            "amount": 100,
            "description": "Private",
            "expense_date": "2026-07-01",
        },
    )

    client.post(
        "/api/auth/register",
        json={"email": "other2@example.com", "password": "password123", "full_name": "Other"},
    )
    other_token = client.post(
        "/api/auth/login", json={"email": "other2@example.com", "password": "password123"}
    ).json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    other_activity = client.get("/api/activity", headers=other_headers).json()
    assert all("Private" not in e["summary"] for e in other_activity)
