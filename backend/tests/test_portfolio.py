def test_create_holding_computes_derived_fields(client, auth_headers):
    response = client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "INFY",
            "name": "Infosys",
            "asset_type": "stock",
            "quantity": 10,
            "buy_price": 1400,
            "buy_date": "2025-01-15",
            "current_price": 1550,
            "broker": "Zerodha",
            "sector": "IT",
            "exchange": "NSE",
        },
    )
    assert response.status_code == 201
    holding = response.json()
    assert holding["invested_value"] == 14000
    assert holding["current_value"] == 15500
    assert holding["profit_loss"] == 1500
    assert round(holding["profit_loss_pct"], 2) == round(1500 / 14000 * 100, 2)
    assert holding["cagr_pct"] is not None


def test_cagr_is_none_for_same_day_purchase(client, auth_headers):
    from datetime import date

    response = client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "RELIANCE",
            "asset_type": "stock",
            "quantity": 1,
            "buy_price": 100,
            "buy_date": date.today().isoformat(),
            "current_price": 110,
        },
    )
    assert response.status_code == 201
    assert response.json()["cagr_pct"] is None


def test_update_holding_partial_fields(client, auth_headers):
    created = client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "TCS",
            "asset_type": "stock",
            "quantity": 5,
            "buy_price": 3000,
            "buy_date": "2025-02-01",
            "current_price": 3200,
        },
    ).json()

    updated = client.put(
        f"/api/portfolio/holdings/{created['id']}",
        headers=auth_headers,
        json={"current_price": 3500},
    )
    assert updated.status_code == 200
    assert updated.json()["current_price"] == 3500
    assert updated.json()["quantity"] == 5


def test_delete_holding(client, auth_headers):
    created = client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "GOLDBEES",
            "asset_type": "gold",
            "quantity": 20,
            "buy_price": 50,
            "buy_date": "2025-03-01",
            "current_price": 55,
        },
    ).json()

    response = client.delete(f"/api/portfolio/holdings/{created['id']}", headers=auth_headers)
    assert response.status_code == 204

    missing = client.get(f"/api/portfolio/holdings/{created['id']}", headers=auth_headers)
    assert missing.status_code == 404
