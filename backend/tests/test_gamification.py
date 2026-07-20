from datetime import date, timedelta


def test_no_spend_streak_with_no_expenses(client, auth_headers):
    response = client.get("/api/gamification", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["no_spend_streak_days"] == 91
    assert body["budget_champion"] is False
    assert body["active_budget_count"] == 0


def test_no_spend_streak_stops_at_expense_day(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    three_days_ago = (date.today() - timedelta(days=3)).isoformat()

    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 200,
            "description": "groceries",
            "expense_date": three_days_ago,
        },
    )

    body = client.get("/api/gamification", headers=auth_headers).json()
    assert body["no_spend_streak_days"] == 3


def test_budget_champion_true_when_all_budgets_within_limit(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/budgets",
        headers=auth_headers,
        json={"category_id": category_id, "monthly_limit": 1000},
    )

    body = client.get("/api/gamification", headers=auth_headers).json()
    assert body["budget_champion"] is True
    assert body["active_budget_count"] == 1
