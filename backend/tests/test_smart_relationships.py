from datetime import date

from dateutil.relativedelta import relativedelta


def _create_goal(client, auth_headers, name="Trip Fund"):
    target_date = (date.today() + relativedelta(months=6)).isoformat()
    return client.post(
        "/api/goals",
        headers=auth_headers,
        json={
            "name": name,
            "target_amount": 50000,
            "current_amount": 0,
            "target_date": target_date,
        },
    ).json()


def test_link_expense_to_goal_on_create(client, auth_headers):
    goal = _create_goal(client, auth_headers)
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]

    expense = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 1000,
            "description": "Flight booking",
            "expense_date": "2026-07-01",
            "goal_id": goal["id"],
        },
    )
    assert expense.status_code == 201
    assert expense.json()["goal_id"] == goal["id"]


def test_link_income_to_goal_and_clear_it(client, auth_headers):
    goal = _create_goal(client, auth_headers)
    category_id = client.get("/api/income/categories", headers=auth_headers).json()[0]["id"]

    income = client.post(
        "/api/income",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 5000,
            "description": "Bonus",
            "income_date": "2026-07-02",
            "goal_id": goal["id"],
        },
    ).json()
    assert income["goal_id"] == goal["id"]

    cleared = client.put(
        f"/api/income/{income['id']}",
        headers=auth_headers,
        json={"clear_goal": True},
    )
    assert cleared.status_code == 200
    assert cleared.json()["goal_id"] is None


def test_linking_expense_to_missing_goal_returns_404(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    response = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 100,
            "description": "x",
            "expense_date": "2026-07-01",
            "goal_id": 999999,
        },
    )
    assert response.status_code == 404


def test_goal_transactions_endpoint_lists_linked_expense_and_income(client, auth_headers):
    goal = _create_goal(client, auth_headers)
    expense_category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    income_category_id = client.get("/api/income/categories", headers=auth_headers).json()[0]["id"]

    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": expense_category_id,
            "amount": 800,
            "description": "Hotel",
            "expense_date": "2026-07-03",
            "goal_id": goal["id"],
        },
    )
    client.post(
        "/api/income",
        headers=auth_headers,
        json={
            "category_id": income_category_id,
            "amount": 2000,
            "description": "Side gig",
            "income_date": "2026-07-04",
            "goal_id": goal["id"],
        },
    )

    response = client.get(f"/api/goals/{goal['id']}/transactions", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body["expenses"]) == 1
    assert body["expenses"][0]["description"] == "Hotel"
    assert len(body["income"]) == 1
    assert body["income"][0]["description"] == "Side gig"


def test_create_holding_with_tags(client, auth_headers):
    tag_id = client.post(
        "/api/tags", headers=auth_headers, json={"name": "Long Term"}
    ).json()["id"]

    holding = client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "HDFC",
            "asset_type": "stock",
            "quantity": 5,
            "buy_price": 1500,
            "buy_date": "2025-01-01",
            "current_price": 1600,
            "tag_ids": [tag_id],
        },
    )
    assert holding.status_code == 201
    assert [t["name"] for t in holding.json()["tags"]] == ["Long Term"]


def test_update_holding_tags(client, auth_headers):
    tag_a = client.post("/api/tags", headers=auth_headers, json={"name": "Core"}).json()["id"]
    tag_b = client.post("/api/tags", headers=auth_headers, json={"name": "Speculative"}).json()["id"]

    created = client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "WIPRO",
            "asset_type": "stock",
            "quantity": 10,
            "buy_price": 400,
            "buy_date": "2025-01-01",
            "current_price": 420,
            "tag_ids": [tag_a],
        },
    ).json()
    assert [t["name"] for t in created["tags"]] == ["Core"]

    updated = client.put(
        f"/api/portfolio/holdings/{created['id']}",
        headers=auth_headers,
        json={"tag_ids": [tag_b]},
    )
    assert updated.status_code == 200
    assert [t["name"] for t in updated.json()["tags"]] == ["Speculative"]


def test_bulk_import_expenses(client, auth_headers):
    categories = client.get("/api/expenses/categories", headers=auth_headers).json()
    category_name = categories[0]["name"]

    response = client.post(
        "/api/expenses/bulk/import",
        headers=auth_headers,
        json={
            "items": [
                {
                    "category_name": category_name,
                    "amount": 250,
                    "description": "Imported 1",
                    "expense_date": "2026-07-05",
                },
                {
                    "category_name": "Not A Real Category",
                    "amount": 100,
                    "description": "Imported 2",
                    "expense_date": "2026-07-06",
                },
            ]
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["imported"] == 1
    assert body["skipped"] == 1
    assert len(body["errors"]) == 1

    expenses = client.get("/api/expenses", headers=auth_headers).json()
    assert any(e["description"] == "Imported 1" for e in expenses)
