def test_archived_expense_hidden_from_default_list_and_restorable(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    created = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 100,
            "description": "test",
            "expense_date": "2026-07-01",
        },
    ).json()

    archived = client.post(f"/api/expenses/{created['id']}/archive", headers=auth_headers)
    assert archived.status_code == 200
    assert archived.json()["is_archived"] is True

    default_list = client.get("/api/expenses", headers=auth_headers).json()
    assert all(e["id"] != created["id"] for e in default_list)

    archived_only = client.get("/api/expenses?archived_only=true", headers=auth_headers).json()
    assert any(e["id"] == created["id"] for e in archived_only)

    restored = client.post(f"/api/expenses/{created['id']}/restore", headers=auth_headers)
    assert restored.status_code == 200
    assert restored.json()["is_archived"] is False

    default_list_after = client.get("/api/expenses", headers=auth_headers).json()
    assert any(e["id"] == created["id"] for e in default_list_after)


def test_archived_portfolio_holding_excluded_from_dashboard(client, auth_headers):
    created = client.post(
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
    ).json()

    client.post(f"/api/portfolio/holdings/{created['id']}/archive", headers=auth_headers)

    summary = client.get("/api/dashboard/summary", headers=auth_headers).json()
    assert summary["total_portfolio_value"] == 0

    holdings = client.get("/api/portfolio/holdings", headers=auth_headers).json()
    assert all(h["id"] != created["id"] for h in holdings)


def test_archive_loan_and_goal(client, auth_headers):
    loan = client.post(
        "/api/loans",
        headers=auth_headers,
        json={
            "name": "Paid Off Loan",
            "loan_type": "personal",
            "principal_amount": 10000,
            "interest_rate": 5,
            "emi_amount": 1000,
            "outstanding_balance": 0,
            "start_date": "2025-01-01",
            "tenure_months": 12,
        },
    ).json()
    archived_loan = client.post(f"/api/loans/{loan['id']}/archive", headers=auth_headers)
    assert archived_loan.status_code == 200
    assert archived_loan.json()["is_archived"] is True

    from datetime import date

    goal = client.post(
        "/api/goals",
        headers=auth_headers,
        json={
            "name": "Old Goal",
            "target_amount": 1000,
            "current_amount": 1000,
            "target_date": date.today().isoformat(),
        },
    ).json()
    archived_goal = client.post(f"/api/goals/{goal['id']}/archive", headers=auth_headers)
    assert archived_goal.status_code == 200
    assert archived_goal.json()["is_archived"] is True

    active_goals = client.get("/api/goals", headers=auth_headers).json()
    assert all(g["id"] != goal["id"] for g in active_goals)
