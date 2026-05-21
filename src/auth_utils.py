import hashlib
import secrets

def generate_salt() -> str:
    return secrets.token_hex(16)

def hash_password(password: str, salt: str) -> str:
    password_bytes = (password + salt).encode('utf-8')
    return hashlib.sha256(password_bytes).hexdigest()