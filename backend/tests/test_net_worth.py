def test_timeline_records_todays_snapshot(client, auth_headers):
    client.post(
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
    )

    response = client.get("/api/networth/timeline", headers=auth_headers)
    assert response.status_code == 200
    points = response.json()["points"]
    assert len(points) == 1
    assert points[0]["net_worth"] == 15000


def test_timeline_is_idempotent_for_same_day(client, auth_headers):
    client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "TCS",
            "asset_type": "stock",
            "quantity": 5,
            "buy_price": 3000,
            "buy_date": "2024-01-01",
            "current_price": 3200,
        },
    )
    first = client.get("/api/networth/timeline", headers=auth_headers).json()["points"]
    second = client.get("/api/networth/timeline", headers=auth_headers).json()["points"]
    assert len(first) == len(second) == 1
    assert first[0]["net_worth"] == second[0]["net_worth"]
