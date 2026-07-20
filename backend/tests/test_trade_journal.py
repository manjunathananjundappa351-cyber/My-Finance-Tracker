def test_create_trade_open_position_has_no_pnl(client, auth_headers):
    response = client.post(
        "/api/trades",
        headers=auth_headers,
        json={
            "symbol": "NIFTY",
            "direction": "long",
            "quantity": 50,
            "entry_price": 22000,
            "entry_date": "2026-07-01",
        },
    )
    assert response.status_code == 201
    trade = response.json()
    assert trade["is_closed"] is False
    assert trade["profit_loss"] is None


def test_closed_long_and_short_trade_pnl(client, auth_headers):
    long_trade = client.post(
        "/api/trades",
        headers=auth_headers,
        json={
            "symbol": "TCS",
            "direction": "long",
            "quantity": 10,
            "entry_price": 3000,
            "entry_date": "2026-07-01",
            "exit_price": 3200,
            "exit_date": "2026-07-05",
        },
    ).json()
    assert long_trade["profit_loss"] == 2000
    assert long_trade["holding_days"] == 4

    short_trade = client.post(
        "/api/trades",
        headers=auth_headers,
        json={
            "symbol": "WIPRO",
            "direction": "short",
            "quantity": 20,
            "entry_price": 500,
            "entry_date": "2026-07-01",
            "exit_price": 480,
            "exit_date": "2026-07-03",
        },
    ).json()
    assert short_trade["profit_loss"] == 400


def test_trade_analytics(client, auth_headers):
    client.post(
        "/api/trades",
        headers=auth_headers,
        json={
            "symbol": "WIN",
            "direction": "long",
            "quantity": 1,
            "entry_price": 100,
            "entry_date": "2026-07-01",
            "exit_price": 150,
            "exit_date": "2026-07-02",
        },
    )
    client.post(
        "/api/trades",
        headers=auth_headers,
        json={
            "symbol": "LOSE",
            "direction": "long",
            "quantity": 1,
            "entry_price": 100,
            "entry_date": "2026-07-01",
            "exit_price": 80,
            "exit_date": "2026-07-02",
        },
    )
    client.post(
        "/api/trades",
        headers=auth_headers,
        json={
            "symbol": "OPEN",
            "direction": "long",
            "quantity": 1,
            "entry_price": 100,
            "entry_date": "2026-07-01",
        },
    )

    analytics = client.get("/api/trades/analytics", headers=auth_headers).json()
    assert analytics["total_trades"] == 3
    assert analytics["closed_trades"] == 2
    assert analytics["win_rate_pct"] == 50.0
    assert analytics["total_profit_loss"] == 30
    assert analytics["best_trade"]["symbol"] == "WIN"
    assert analytics["worst_trade"]["symbol"] == "LOSE"


def test_update_and_delete_trade(client, auth_headers):
    created = client.post(
        "/api/trades",
        headers=auth_headers,
        json={
            "symbol": "HDFC",
            "direction": "long",
            "quantity": 5,
            "entry_price": 1500,
            "entry_date": "2026-07-01",
        },
    ).json()

    updated = client.put(
        f"/api/trades/{created['id']}",
        headers=auth_headers,
        json={"exit_price": 1600, "exit_date": "2026-07-10", "lessons": "Patience paid off"},
    )
    assert updated.status_code == 200
    assert updated.json()["is_closed"] is True

    deleted = client.delete(f"/api/trades/{created['id']}", headers=auth_headers)
    assert deleted.status_code == 204
