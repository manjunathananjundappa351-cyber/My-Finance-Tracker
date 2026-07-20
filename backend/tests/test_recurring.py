from datetime import date

from dateutil.relativedelta import relativedelta


def test_recurring_expense_backfills_missed_months(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    template_date = date.today() - relativedelta(months=2)

    created = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 500,
            "description": "Rent",
            "expense_date": template_date.isoformat(),
            "is_recurring": True,
        },
    )
    assert created.status_code == 201
    assert created.json()["is_recurring"] is True

    listed = client.get("/api/expenses", headers=auth_headers).json()
    rent_entries = [e for e in listed if e["description"] == "Rent"]
    # original template + 2 backfilled months (today is 2 months after the template date)
    assert len(rent_entries) == 3

    children = [e for e in rent_entries if e["recurring_parent_id"] is not None]
    assert len(children) == 2
    assert all(not c["is_recurring"] for c in children)


def test_recurring_generation_is_idempotent(client, auth_headers):
    category_id = client.get("/api/expenses/categories", headers=auth_headers).json()[0]["id"]
    template_date = date.today() - relativedelta(months=1)

    client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 200,
            "description": "Internet",
            "expense_date": template_date.isoformat(),
            "is_recurring": True,
        },
    )

    first = client.get("/api/expenses", headers=auth_headers).json()
    second = client.get("/api/expenses", headers=auth_headers).json()
    assert len(first) == len(second)


def test_recurring_income_backfills_missed_months(client, auth_headers):
    category_id = client.get("/api/income/categories", headers=auth_headers).json()[0]["id"]
    template_date = date.today() - relativedelta(months=1)

    client.post(
        "/api/income",
        headers=auth_headers,
        json={
            "category_id": category_id,
            "amount": 50000,
            "description": "Salary",
            "income_date": template_date.isoformat(),
            "is_recurring": True,
        },
    )

    listed = client.get("/api/income", headers=auth_headers).json()
    salary_entries = [i for i in listed if i["description"] == "Salary"]
    assert len(salary_entries) == 2
