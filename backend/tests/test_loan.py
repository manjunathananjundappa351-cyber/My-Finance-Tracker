from datetime import date

from dateutil.relativedelta import relativedelta


def test_create_loan_computes_progress_and_next_due(client, auth_headers):
    start = (date.today() - relativedelta(months=3)).isoformat()

    created = client.post(
        "/api/loans",
        headers=auth_headers,
        json={
            "name": "Home Loan",
            "loan_type": "home",
            "principal_amount": 1000000,
            "interest_rate": 8.5,
            "emi_amount": 12000,
            "outstanding_balance": 970000,
            "start_date": start,
            "tenure_months": 240,
        },
    )
    assert created.status_code == 201
    loan = created.json()
    assert loan["paid_amount"] == 30000
    assert round(loan["progress_pct"], 2) == 3.0
    assert loan["next_due_date"] >= date.today().isoformat()


def test_update_and_delete_loan(client, auth_headers):
    created = client.post(
        "/api/loans",
        headers=auth_headers,
        json={
            "name": "Car Loan",
            "loan_type": "car",
            "principal_amount": 500000,
            "interest_rate": 9.0,
            "emi_amount": 10000,
            "outstanding_balance": 500000,
            "start_date": date.today().isoformat(),
            "tenure_months": 60,
        },
    ).json()

    updated = client.put(
        f"/api/loans/{created['id']}",
        headers=auth_headers,
        json={"outstanding_balance": 450000},
    )
    assert updated.status_code == 200
    assert updated.json()["outstanding_balance"] == 450000

    deleted = client.delete(f"/api/loans/{created['id']}", headers=auth_headers)
    assert deleted.status_code == 204

    remaining = client.get("/api/loans", headers=auth_headers).json()
    assert all(loan["id"] != created["id"] for loan in remaining)


def test_loans_reduce_net_worth(client, auth_headers):
    client.post(
        "/api/portfolio/holdings",
        headers=auth_headers,
        json={
            "symbol": "INFY",
            "asset_type": "stock",
            "quantity": 10,
            "buy_price": 1000,
            "buy_date": "2024-01-01",
            "current_price": 1200,
        },
    )
    client.post(
        "/api/loans",
        headers=auth_headers,
        json={
            "name": "Personal Loan",
            "loan_type": "personal",
            "principal_amount": 5000,
            "interest_rate": 12,
            "emi_amount": 500,
            "outstanding_balance": 5000,
            "start_date": date.today().isoformat(),
            "tenure_months": 12,
        },
    )

    summary = client.get("/api/dashboard/summary", headers=auth_headers).json()
    assert summary["total_portfolio_value"] == 12000
    assert summary["net_worth"] == 12000 - 5000
