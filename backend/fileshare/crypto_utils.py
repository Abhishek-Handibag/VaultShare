
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import base64
import os

def generate_key():
    """Generate a random encryption key"""
    return Fernet.generate_key()

def encrypt_file(file_data, key):
    """Encrypt file data using Fernet (AES)"""
    f = Fernet(key)
    return f.encrypt(file_data)

def decrypt_file(encrypted_data, key):
    """Decrypt file data using Fernet (AES)"""
    f = Fernet(key)
    return f.decrypt(encrypted_data)

def encrypt_key(key, user_password):
    """Encrypt the file encryption key with user's password"""
    salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key_encryption_key = base64.b64encode(kdf.derive(user_password.encode()))
    f = Fernet(key_encryption_key)
    return base64.b64encode(salt + f.encrypt(key)).decode('utf-8')

def decrypt_key(encrypted_key, user_password):
    """Decrypt the file encryption key with user's password"""
    encrypted_data = base64.b64decode(encrypted_key)
    salt = encrypted_data[:16]
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key_encryption_key = base64.b64encode(kdf.derive(user_password.encode()))
    f = Fernet(key_encryption_key)
    return f.decrypt(encrypted_data[16:])