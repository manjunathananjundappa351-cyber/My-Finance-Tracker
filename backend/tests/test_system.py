def test_application_health(client, auth_headers):
    response = client.get("/api/system/health", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database_connected"] is True
    assert body["api_version"]
    assert body["environment"]


def test_global_search_across_modules(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 300,
            "description": "Zomato order",
            "expense_date": "2026-07-01",
        },
    )
    client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "ZOMATO",
            "asset_type": "stock",
            "quantity": 10,
            "buy_price": 100,
            "buy_date": "2024-01-01",
            "current_price": 120,
        },
    )

    response = client.get("/api/search?q=zomato", headers=auth_headers)
    assert response.status_code == 200
    results = response.json()["results"]
    types = {r["type"] for r in results}
    assert "expense" in types
    assert "portfolio" in types


def test_search_short_query_returns_empty(client, auth_headers):
    response = client.get("/api/search?q=a", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["results"] == []
