def test_bulk_archive_and_restore_expenses(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    ids = []
    for i in range(3):
        created = client.post(
            "/api/expenses",
            headers=auth_headers,
            json={
                "category_id": category_id,
                "amount": 100 + i,
                "description": f"item{i}",
                "expense_date": "2026-07-01",
            },
        ).json()
        ids.append(created["id"])

    response = client.post("/api/expenses/bulk/archive", headers=auth_headers, json={"ids": ids})
    assert response.status_code == 204

    active = client.get("/api/expenses", headers=auth_headers).json()
    assert all(e["id"] not in ids for e in active)

    restore_response = client.post(
        "/api/expenses/bulk/restore", headers=auth_headers, json={"ids": ids}
    )
    assert restore_response.status_code == 204

    active_after = client.get("/api/expenses", headers=auth_headers).json()
    assert all(any(e["id"] == i for e in active_after) for i in ids)


def test_bulk_delete_expenses(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    ids = []
    for i in range(2):
        created = client.post(
            "/api/expenses",
            headers=auth_headers,
            json={
                "category_id": category_id,
                "amount": 50 + i,
                "description": f"del{i}",
                "expense_date": "2026-07-01",
            },
        ).json()
        ids.append(created["id"])

    response = client.post("/api/expenses/bulk/delete", headers=auth_headers, json={"ids": ids})
    assert response.status_code == 204

    for expense_id in ids:
        missing = client.get(f"/api/expenses/{expense_id}", headers=auth_headers)
        assert missing.status_code == 404
