def test_default_categories_seeded_on_register(client, auth_headers):
    response = client.get("/api/expenses/categories", headers=auth_headers)
    assert response.status_code == 200
    names = {c["name"] for c in response.json()}
    assert "Rent" in names
    assert "Movies" in names


def test_create_and_list_expense(client, auth_headers):
    categories = client.get("/api/expenses/categories", headers=auth_headers).json()
    category_id = categories[0]["id"]

    create_response = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 1200.5,
            "description": "Monthly bill",
            "expense_date": "2026-07-01",
        },
    )
    assert create_response.status_code == 201
    expense = create_response.json()
    assert expense["amount"] == 1200.5
    assert expense["category"]["id"] == category_id

    list_response = client.get("/api/expenses", headers=auth_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


def test_create_expense_with_invalid_category_returns_404(client, auth_headers):
    response = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": 999999,
            "amount": 100,
            "description": "x",
            "expense_date": "2026-07-01",
        },
    )
    assert response.status_code == 404


def test_update_and_delete_expense(client, auth_headers):
    categories = client.get("/api/expenses/categories", headers=auth_headers).json()
    category_id = categories[0]["id"]
    created = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 500,
            "description": "Initial",
            "expense_date": "2026-07-05",
        },
    ).json()

    updated = client.put(
        f"/api/expenses/{created['id']}",
        headers=auth_headers,
        json={"amount": 750},
    )
    assert updated.status_code == 200
    assert updated.json()["amount"] == 750

    deleted = client.delete(f"/api/expenses/{created['id']}", headers=auth_headers)
    assert deleted.status_code == 204

    missing = client.get(f"/api/expenses/{created['id']}", headers=auth_headers)
    assert missing.status_code == 404


def test_expenses_are_scoped_to_owner(client):
    client.post(
        "/api/auth/register",
        json={"email": "owner@example.com", "password": "password123", "full_name": "Owner"},
    )
    owner_token = client.post(
        "/api/auth/login", json={"email": "owner@example.com", "password": "password123"}
    ).json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    client.post(
        "/api/auth/register",
        json={"email": "other@example.com", "password": "password123", "full_name": "Other"},
    )
    other_token = client.post(
        "/api/auth/login", json={"email": "other@example.com", "password": "password123"}
    ).json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    owner_category = client.get("/api/expenses/categories", headers=owner_headers).json()[0]
    expense = client.post(
        "/api/expenses",
        headers=owner_headers,
        json={
            "category_id": owner_category["id"],
            "amount": 300,
            "description": "Private",
            "expense_date": "2026-07-10",
        },
    ).json()

    response = client.get(f"/api/expenses/{expense['id']}", headers=other_headers)
    assert response.status_code == 404
