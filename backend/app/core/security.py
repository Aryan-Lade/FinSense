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
