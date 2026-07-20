from datetime import date


def test_exceeding_budget_generates_notification(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/budgets",
        headers=auth_headers,
        json={"category_id": category_id, "monthly_limit": 100},
    )
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 150,
            "description": "overspend",
            "expense_date": date.today().isoformat(),
        },
    )

    response = client.get("/api/notifications", headers=auth_headers)
    assert response.status_code == 200
    notifications = response.json()
    assert len(notifications) >= 1
    assert any(n["level"] == "error" for n in notifications)
    assert all(not n["is_read"] for n in notifications)


def test_notifications_not_duplicated_on_repeat_fetch(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/budgets",
        headers=auth_headers,
        json={"category_id": category_id, "monthly_limit": 100},
    )
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 150,
            "description": "overspend",
            "expense_date": date.today().isoformat(),
        },
    )

    first = client.get("/api/notifications", headers=auth_headers).json()
    second = client.get("/api/notifications", headers=auth_headers).json()
    assert len(first) == len(second)


def test_mark_read_and_mark_all_read(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/budgets",
        headers=auth_headers,
        json={"category_id": category_id, "monthly_limit": 100},
    )
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 150,
            "description": "overspend",
            "expense_date": date.today().isoformat(),
        },
    )

    notifications = client.get("/api/notifications", headers=auth_headers).json()
    first_id = notifications[0]["id"]

    read_response = client.post(f"/api/notifications/{first_id}/read", headers=auth_headers)
    assert read_response.status_code == 200
    assert read_response.json()["is_read"] is True

    mark_all = client.post("/api/notifications/read-all", headers=auth_headers)
    assert mark_all.status_code == 204

    all_notifications = client.get("/api/notifications", headers=auth_headers).json()
    assert all(n["is_read"] for n in all_notifications)
