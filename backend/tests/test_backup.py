def test_export_includes_created_records(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    tag_id = client.post("/api/tags", headers=auth_headers, json={"name": "Friends"}).json()["id"]
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 500,
            "description": "Dinner",
            "expense_date": "2026-07-01",
            "tag_ids": [tag_id],
        },
    )
    client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "INFY",
            "asset_type": "stock",
            "quantity": 10,
            "buy_price": 1000,
            "buy_date": "2024-01-01",
            "current_price": 1500,
        },
    )

    response = client.get("/api/backup/export", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["expenses"]) == 1
    assert data["expenses"][0]["description"] == "Dinner"
    assert data["expenses"][0]["tags"] == ["Friends"]
    assert len(data["portfolio_holdings"]) == 1
    assert "Friends" in data["tags"]


def test_restore_recreates_records_for_the_same_user(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 300,
            "description": "Lunch",
            "expense_date": "2026-07-01",
        },
    )
    exported = client.get("/api/backup/export", headers=auth_headers).json()

    response = client.post("/api/backup/restore", headers=auth_headers, json=exported)
    assert response.status_code == 200
    summary = response.json()
    assert summary["expenses_imported"] == 1

    all_expenses = client.get("/api/expenses", headers=auth_headers).json()
    lunch_entries = [e for e in all_expenses if e["description"] == "Lunch"]
    assert len(lunch_entries) == 2


def test_restore_into_fresh_account_recreates_categories_and_tags(client):
    client.post(
        "/api/auth/register",
        json={"email": "backupsrc@example.com", "password": "password123", "full_name": "Source"},
    )
    src_token = client.post(
        "/api/auth/login", json={"email": "backupsrc@example.com", "password": "password123"}
    ).json()["access_token"]
    src_headers = {"Authorization": f"Bearer {src_token}"}

    category_id = client.get("/api/expenses/categories", headers=src_headers).json()[0]["id"]
    tag_id = client.post("/api/tags", headers=src_headers, json={"name": "Weekend"}).json()["id"]
    client.post(
        "/api/expenses",
        headers=src_headers,
        json={
            "category_id": category_id,
            "amount": 750,
            "description": "Brunch",
            "expense_date": "2026-07-01",
            "tag_ids": [tag_id],
        },
    )
    exported = client.get("/api/backup/export", headers=src_headers).json()

    client.post(
        "/api/auth/register",
        json={"email": "backupdst@example.com", "password": "password123", "full_name": "Dest"},
    )
    dst_token = client.post(
        "/api/auth/login", json={"email": "backupdst@example.com", "password": "password123"}
    ).json()["access_token"]
    dst_headers = {"Authorization": f"Bearer {dst_token}"}

    response = client.post("/api/backup/restore", headers=dst_headers, json=exported)
    assert response.status_code == 200

    dst_expenses = client.get("/api/expenses", headers=dst_headers).json()
    brunch = next(e for e in dst_expenses if e["description"] == "Brunch")
    assert brunch["amount"] == 750
    assert [t["name"] for t in brunch["tags"]] == ["Weekend"]
