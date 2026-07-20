from datetime import date


def test_health_score_returns_five_components(client, auth_headers):
    response = client.get("/api/health-score", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert 0 <= body["overall_score"] <= 100
    assert len(body["components"]) == 5
    labels = {c["label"] for c in body["components"]}
    assert labels == {
        "Savings",
        "Debt",
        "Investment Diversification",
        "Expense Control",
        "Emergency Fund",
    }


def test_health_score_improves_with_savings_and_no_debt(client, auth_headers):
    income_category_id = client.get("/api/income/categories", headers=auth_headers).json()[0]["id"]
    client.post(
        "/api/income",
        headers=auth_headers,
        json={
            "category_id": income_category_id,
            "amount": 100000,
            "description": "Salary",
            "income_date": date.today().isoformat(),
        },
    )

    response = client.get("/api/health-score", headers=auth_headers)
    savings_component = next(
        c for c in response.json()["components"] if c["label"] == "Savings"
    )
    assert savings_component["score"] == 100
    assert savings_component["rating"] == "Excellent"
