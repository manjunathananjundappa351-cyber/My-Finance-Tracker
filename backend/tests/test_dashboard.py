def test_dashboard_summary_aggregates_expense_income_and_portfolio(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    income_category_id = client.get("/api/income/categories", headers=auth_headers).json()[0][
        "id"
    ]

    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 2000,
            "description": "Groceries",
            "expense_date": "2026-07-05",
        },
    )
    client.post(
        "/api/income",
        headers=auth_headers,
        json={
            "category_id": income_category_id,
            "amount": 50000,
            "description": "Salary",
            "income_date": "2026-07-01",
        },
    )
    client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "INFY",
            "asset_type": "stock",
            "quantity": 10,
            "buy_price": 1400,
            "buy_date": "2025-01-15",
            "current_price": 1550,
        },
    )

    response = client.get("/api/dashboard/summary", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()

    assert body["monthly_expenses"] == 2000
    assert body["monthly_income"] == 50000
    assert body["total_portfolio_value"] == 15500
    assert body["net_worth"] == 15500
    assert len(body["expense_trend"]) == 6
    assert len(body["cash_flow"]) == 6
    assert any(g["symbol"] == "INFY" for g in body["top_gainers"])
