import hashlib

import bcrypt


def hash_token(token: str) -> str:
    """Возвращает SHA-256 хеш токена в hex-виде.

    :param token: исходный токен.
    :return: hex-представление хеша.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_password(password: str):
    """Хеширует пароль.

    :param password: пароль в открытом виде.
    :return: хеш пароля.
    """
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
