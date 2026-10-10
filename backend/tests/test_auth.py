import pytest
from fastapi.testclient import TestClient
from app.main import app
import time

client = TestClient(app)

def test_auth_config():
    res = client.get("/api/auth/config")
    assert res.status_code == 200
    data = res.json()
    assert "supabase_configured" in data
    assert "auth_mode" in data

def test_user_registration_and_login_flow():
    ts = int(time.time() * 1000)
    email = f"account_{ts}@finsense-test.in"
    password = "SecurePassword123!"

    # 1. Register new user
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test Account"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == email
    token = reg_data["access_token"]

    # 2. Prevent duplicate email registration
    dup_res = client.post("/api/auth/register", json={
        "email": email,
        "password": password
    })
    assert dup_res.status_code == 400

    # 3. Log in with wrong password
    bad_login = client.post("/api/auth/login", json={
        "email": email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 4. Log in with correct credentials
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == email

    # 5. Fetch current user profile with token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == email
    assert me_data["full_name"] == "Test Account"

    # 6. Reject unauthenticated /me
    anon_res = client.get("/api/auth/me")
    assert anon_res.status_code == 401
