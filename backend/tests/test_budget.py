def test_create_budget_and_track_spend(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]

    created = client.post(
        "/api/budgets",
        headers=auth_headers,
        json={"category_id": category_id, "monthly_limit": 1000},
    )
    assert created.status_code == 201
    budget = created.json()
    assert budget["monthly_limit"] == 1000
    assert budget["spent"] == 0
    assert budget["remaining"] == 1000

    from datetime import date

    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 800,
            "description": "test",
            "expense_date": date.today().isoformat(),
        },
    )

    listed = client.get("/api/budgets", headers=auth_headers).json()
    matching = next(b for b in listed if b["id"] == budget["id"])
    assert matching["spent"] == 800
    assert matching["remaining"] == 200
    assert matching["percent_used"] == 80


def test_duplicate_budget_for_same_category_conflicts(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/budgets", headers=auth_headers, json={"category_id": category_id, "monthly_limit": 500}
    )
    response = client.post(
        "/api/budgets", headers=auth_headers, json={"category_id": category_id, "monthly_limit": 700}
    )
    assert response.status_code == 409


def test_budget_invalid_category_404(client, auth_headers):
    response = client.post(
        "/api/budgets", headers=auth_headers, json={"category_id": 999999, "monthly_limit": 500}
    )
    assert response.status_code == 404


def test_update_and_delete_budget(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[1]["id"]
    created = client.post(
        "/api/budgets", headers=auth_headers, json={"category_id": category_id, "monthly_limit": 300}
    ).json()

    updated = client.put(
        f"/api/budgets/{created['id']}", headers=auth_headers, json={"monthly_limit": 450}
    )
    assert updated.status_code == 200
    assert updated.json()["monthly_limit"] == 450

    deleted = client.delete(f"/api/budgets/{created['id']}", headers=auth_headers)
    assert deleted.status_code == 204

    remaining = client.get("/api/budgets", headers=auth_headers).json()
    assert all(b["id"] != created["id"] for b in remaining)
