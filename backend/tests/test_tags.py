def test_create_tag_and_attach_to_expense(client, auth_headers):
    tag = client.post(
        "/api/tags", headers=auth_headers, json={"name": "Friends", "color": "#ff9500"}
    )
    assert tag.status_code == 201
    tag_id = tag.json()["id"]

    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    expense = client.post(
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
    assert expense.status_code == 201
    assert [t["name"] for t in expense.json()["tags"]] == ["Friends"]


def test_duplicate_tag_name_conflicts(client, auth_headers):
    client.post("/api/tags", headers=auth_headers, json={"name": "Weekend"})
    response = client.post("/api/tags", headers=auth_headers, json={"name": "Weekend"})
    assert response.status_code == 409


def test_filter_expenses_by_tag(client, auth_headers):
    tag_id = client.post("/api/tags", headers=auth_headers, json={"name": "Office"}).json()["id"]
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]

    tagged = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 200,
            "description": "Lunch",
            "expense_date": "2026-07-01",
            "tag_ids": [tag_id],
        },
    ).json()
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 300,
            "description": "Untagged",
            "expense_date": "2026-07-01",
        },
    )

    filtered = client.get(f"/api/expenses?tag_id={tag_id}", headers=auth_headers).json()
    assert len(filtered) == 1
    assert filtered[0]["id"] == tagged["id"]


def test_delete_tag(client, auth_headers):
    tag = client.post("/api/tags", headers=auth_headers, json={"name": "Birthday"}).json()
    response = client.delete(f"/api/tags/{tag['id']}", headers=auth_headers)
    assert response.status_code == 204

    remaining = client.get("/api/tags", headers=auth_headers).json()
    assert all(t["id"] != tag["id"] for t in remaining)
