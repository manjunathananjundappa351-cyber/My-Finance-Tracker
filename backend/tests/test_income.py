def test_default_income_categories_seeded(client, auth_headers):
    response = client.get("/api/income/categories", headers=auth_headers)
    assert response.status_code == 200
    names = {c["name"] for c in response.json()}
    assert "Salary" in names


def test_create_update_delete_income(client, auth_headers):
    category_id = client.get("/api/income/categories", headers=auth_headers).json()[0]["id"]

    created = client.post(
        "/api/income",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 50000,
            "description": "July salary",
            "income_date": "2026-07-01",
        },
    )
    assert created.status_code == 201
    income_id = created.json()["id"]

    updated = client.put(
        f"/api/income/{income_id}", headers=auth_headers, json={"amount": 55000}
    )
    assert updated.status_code == 200
    assert updated.json()["amount"] == 55000

    deleted = client.delete(f"/api/income/{income_id}", headers=auth_headers)
    assert deleted.status_code == 204
