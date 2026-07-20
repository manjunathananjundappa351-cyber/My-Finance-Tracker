from datetime import date

from dateutil.relativedelta import relativedelta


def test_create_goal_computes_progress_and_contribution(client, auth_headers):
    target_date = (date.today() + relativedelta(months=6)).isoformat()

    created = client.post(
        "/api/goals",
        headers=auth_headers,
        json={
            "name": "Emergency Fund",
            "target_amount": 60000,
            "current_amount": 0,
            "target_date": target_date,
        },
    )
    assert created.status_code == 201
    goal = created.json()
    assert goal["progress_pct"] == 0
    assert goal["months_remaining"] in (5, 6)
    assert goal["monthly_contribution_needed"] > 0


def test_update_goal_current_amount(client, auth_headers):
    target_date = (date.today() + relativedelta(months=3)).isoformat()
    created = client.post(
        "/api/goals",
        headers=auth_headers,
        json={
            "name": "New Car",
            "target_amount": 300000,
            "current_amount": 0,
            "target_date": target_date,
        },
    ).json()

    updated = client.put(
        f"/api/goals/{created['id']}", headers=auth_headers, json={"current_amount": 150000}
    )
    assert updated.status_code == 200
    body = updated.json()
    assert body["current_amount"] == 150000
    assert body["progress_pct"] == 50


def test_delete_goal(client, auth_headers):
    target_date = (date.today() + relativedelta(months=12)).isoformat()
    created = client.post(
        "/api/goals",
        headers=auth_headers,
        json={
            "name": "Trip",
            "target_amount": 100000,
            "current_amount": 0,
            "target_date": target_date,
        },
    ).json()

    response = client.delete(f"/api/goals/{created['id']}", headers=auth_headers)
    assert response.status_code == 204

    remaining = client.get("/api/goals", headers=auth_headers).json()
    assert all(g["id"] != created["id"] for g in remaining)
