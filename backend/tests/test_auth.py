def test_register_creates_user_with_default_categories(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "password123", "full_name": "Alice"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert "hashed_password" not in body


def test_register_duplicate_email_conflicts(client):
    payload = {"email": "bob@example.com", "password": "password123", "full_name": "Bob"}
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


def test_login_success_and_failure(client):
    client.post(
        "/api/auth/register",
        json={"email": "carol@example.com", "password": "password123", "full_name": "Carol"},
    )

    good = client.post(
        "/api/auth/login", json={"email": "carol@example.com", "password": "password123"}
    )
    assert good.status_code == 200
    assert "access_token" in good.json()
    assert "refresh_token" in good.json()

    bad = client.post(
        "/api/auth/login", json={"email": "carol@example.com", "password": "wrong"}
    )
    assert bad.status_code == 401


def test_me_requires_valid_token(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

    unauthorized = client.get("/api/auth/me")
    assert unauthorized.status_code == 401


def test_refresh_token_issues_new_access_token(client):
    client.post(
        "/api/auth/register",
        json={"email": "dave@example.com", "password": "password123", "full_name": "Dave"},
    )
    login = client.post(
        "/api/auth/login", json={"email": "dave@example.com", "password": "password123"}
    )
    refresh_token = login.json()["refresh_token"]

    response = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_rejects_access_token(client, auth_headers):
    token = auth_headers["Authorization"].split(" ")[1]
    response = client.post("/api/auth/refresh", json={"refresh_token": token})
    assert response.status_code == 401


def test_update_profile_changes_full_name(client, auth_headers):
    response = client.put(
        "/api/auth/me", headers=auth_headers, json={"full_name": "Updated Name"}
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Name"


def test_change_password_rejects_wrong_current_password(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "wrongpassword", "new_password": "newpassword123"},
    )
    assert response.status_code == 400


def test_change_password_then_login_with_new_password(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "password123", "new_password": "newpassword123"},
    )
    assert response.status_code == 204

    old_login = client.post(
        "/api/auth/login", json={"email": "test@example.com", "password": "password123"}
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/auth/login", json={"email": "test@example.com", "password": "newpassword123"}
    )
    assert new_login.status_code == 200
