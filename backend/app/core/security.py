"""
FinSense security utilities.
"""
import os
import secrets
from typing import Optional
from cryptography.fernet import Fernet


def generate_secret_key() -> str:
    """Generate a cryptographically secure secret key."""
    return secrets.urlsafe_b64encode(secrets.token_bytes(32)).decode("utf-8")


def get_or_create_encryption_key() -> str:
    """Get encryption key from environment or generate a new one."""
    # In production, this should come from environment variable
    key = os.getenv("TOKEN_ENC_KEY")
    if not key:
        # Generate and return a new key (in real app, this should be stored securely)
        key = generate_secret_key()
    return key


def get_cipher_suite() -> Fernet:
    """Get Fernet cipher suite for encryption/decryption."""
    key = get_or_create_encryption_key()
    # Fernet key must be 32 url-safe base64-encoded bytes
    if len(key) != 44:  # Fernet keys are 44 characters when base64 encoded
        # If not properly formatted, generate a new one
        key = generate_secret_key()
    return Fernet(key.encode("utf-8"))


def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive data using Fernet."""
    cipher = get_cipher_suite()
    encrypted_data = cipher.encrypt(data.encode("utf-8"))
    return encrypted_data.decode("utf-8")


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive data using Fernet."""
    cipher = get_cipher_suite()
    decrypted_data = cipher.decrypt(encrypted_data.encode("utf-8"))
    return decrypted_data.decode("utf-8")


def verify_webhook_signature(
    payload: bytes, signature: str, secret: str
) -> bool:
    """Verify webhook signature using HMAC-SHA256."""
    import hmac
    import hashlib
    
    expected_signature = hmac.new(
        secret.encode("utf-8"), payload, hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_signature}", signature)


# ============================================================================
# Password Hashing & Verification (PBKDF2-HMAC-SHA256)
# ============================================================================

def get_password_hash(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with cryptographically random salt."""
    import hashlib
    import secrets
    salt = secrets.token_hex(16)
    iterations = 100000
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    )
    return f"pbkdf2:sha256:{iterations}${salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against PBKDF2-HMAC-SHA256 hash."""
    import hashlib
    import hmac
    if not hashed_password or not hashed_password.startswith("pbkdf2:sha256:"):
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        meta, salt, stored_key = parts
        iterations = int(meta.split(":")[2])
        computed_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        ).hex()
        return hmac.compare_digest(stored_key, computed_key)
    except Exception:
        return False


# ============================================================================
# JWT Token Generation and Verification (HS256)
# ============================================================================

def _base64url_encode(data: bytes) -> str:
    import base64
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _base64url_decode(s: str) -> bytes:
    import base64
    padding = '=' * (4 - (len(s) % 4)) if len(s) % 4 != 0 else ''
    return base64.urlsafe_b64decode((s + padding).encode('utf-8'))


def create_access_token(data: dict, expires_delta: Optional[object] = None) -> str:
    """Create a standard HS256 JWT access token."""
    import hmac
    import hashlib
    import json
    import time
    from datetime import datetime, timedelta
    from app.core.config import settings

    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()

    now = int(time.time())
    if expires_delta and isinstance(expires_delta, timedelta):
        exp = now + int(expires_delta.total_seconds())
    else:
        exp = now + (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    payload["iat"] = now
    payload["exp"] = exp

    header_b64 = _base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = _base64url_encode(json.dumps(payload, default=str).encode('utf-8'))
    message = f"{header_b64}.{payload_b64}".encode('utf-8')

    secret = settings.JWT_SECRET.encode('utf-8')
    signature = hmac.new(secret, message, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify HS256 JWT token."""
    import hmac
    import hashlib
    import json
    import time
    from app.core.config import settings

    try:
        parts = token.strip().split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        message = f"{header_b64}.{payload_b64}".encode('utf-8')
        secret = settings.JWT_SECRET.encode('utf-8')
        expected_sig = hmac.new(secret, message, hashlib.sha256).digest()

        # If Supabase secret is provided, also try verifying with that
        if not hmac.compare_digest(_base64url_encode(expected_sig), sig_b64):
            if settings.SUPABASE_JWT_SECRET:
                supa_secret = settings.SUPABASE_JWT_SECRET.encode('utf-8')
                supa_expected = hmac.new(supa_secret, message, hashlib.sha256).digest()
                if not hmac.compare_digest(_base64url_encode(supa_expected), sig_b64):
                    return None
            else:
                return None

        payload = json.loads(_base64url_decode(payload_b64).decode('utf-8'))
        exp = payload.get("exp")
        if exp and int(exp) < int(time.time()):
            return None  # Token expired

        return payload
    except Exception:
        return None

