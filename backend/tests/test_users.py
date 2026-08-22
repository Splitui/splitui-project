import pytest

from tests.utils import future_date


def test_register_success(app_client):
    payload = {"username": "test_01", "password": "Qwerty123"}

    response = app_client.post("/auth/register", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "test_01"
    assert "auth_token" in body
    assert "password" not in body
    assert "password_hash" not in body


def test_register_duplicate_username_fails(app_client, create_user):
    create_user(username="test_01")
    payload = {"username": "test_01", "password": "Qwerty123"}

    response = app_client.post("/auth/register", json=payload)

    assert response.status_code == 409


@pytest.mark.parametrize(
    "payload",
    [
        pytest.param({"username": "te", "password": "Qwerty123"}, id="username_too_short"),
        pytest.param({"username": "test 01", "password": "Qwerty123"}, id="username_with_space"),
        pytest.param({"username": "test@01", "password": "Qwerty123"}, id="username_invalid_char"),
        pytest.param({"username": "test_01", "password": "short1"}, id="password_too_short"),
        pytest.param({"username": "test_01", "password": "onlyletters"}, id="password_without_digit"),
        pytest.param({"username": "test_01", "password": "12345678"}, id="password_without_letter"),
        pytest.param({"username": "test_01"}, id="missing_password"),
        pytest.param({"password": "Qwerty123"}, id="missing_username"),
    ],
)
def test_register_invalid_data(app_client, payload):
    response = app_client.post("/auth/register", json=payload)

    assert response.status_code == 422


def test_login_success(app_client, create_user):
    user = create_user(username="test_01", password="Qwerty123")

    response = app_client.post(
        "/auth/login",
        json={"username": user["username"], "password": user["password"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "test_01"
    assert "auth_token" in body


def test_login_wrong_password_fails(app_client, create_user):
    user = create_user(username="test_01", password="Qwerty123")

    response = app_client.post(
        "/auth/login",
        json={"username": user["username"], "password": "WrongPass1"},
    )

    assert response.status_code == 401


def test_login_nonexistent_username_fails(app_client):
    response = app_client.post(
        "/auth/login",
        json={"username": "no_such_user", "password": "Qwerty123"},
    )

    assert response.status_code == 401


def test_login_different_tokens_on_each_call(app_client, create_user):
    user = create_user(username="test_01", password="Qwerty123")
    payload = {"username": user["username"], "password": user["password"]}

    response_1 = app_client.post("/auth/login", json=payload)
    response_2 = app_client.post("/auth/login", json=payload)

    assert response_1.json()["auth_token"] != response_2.json()["auth_token"]


def test_get_my_meetings_without_token_fails(app_client):
    response = app_client.get("/users/me/meetings")

    assert response.status_code == 401


def test_get_my_meetings_with_invalid_token_fails(app_client):
    response = app_client.get(
        "/users/me/meetings",
        headers={"Authorization": "Bearer not_a_real_token"},
    )

    assert response.status_code == 401


def test_get_my_meetings_with_valid_token_success(app_client, create_user):
    user = create_user(username="test_01", password="Qwerty123")
    token = user["auth_token"]

    response = app_client.get(
        "/users/me/meetings",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json() == []


def test_create_meeting_saved_user_by_token(app_client, create_user, create_meeting, create_participant):
    user = create_user()
    token = user["auth_token"]

    response = app_client.post(
        "/meetings",
        json={
            "title": "Моя встреча",
            "start_date": future_date().isoformat(),
            "creator_nickname": "Тестовый участник",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    meeting = response.json()
    assert user["id"] == meeting["meeting_creator"]["user_id"]


def test_get_my_meetings_returns_only_own_meetings(app_client, create_user, create_meeting, create_participant):
    user = create_user()
    token = user["auth_token"]
    create_meeting(title="Моя встреча", user_id=user["id"])

    response = app_client.get(
        "/users/me/meetings",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    meetings = response.json()
    assert len(meetings) == 1
    assert meetings[0]["title"] == "Моя встреча"
