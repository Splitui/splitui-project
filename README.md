# splitui-project

## Backend

Backend-часть проекта, разработанная на **FastAPI**.

### Требования

* Python 3.13+

### Установка uv

Установите `uv` через pip:

```bash
pip install uv
```

Проверьте установку:

```bash
uv --version
```

### Установка зависимостей

Перейдите в директорию backend:

```bash
cd backend
```

Установите зависимости проекта:

```bash
uv sync
```

Команда автоматически создаст виртуальное окружение `.venv` и установит все необходимые зависимости.

### Активация виртуального окружения

**Windows (CMD):**

```cmd
.venv\Scripts\activate.bat
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

### Запуск

Находясь в директории `backend` и после активации виртуального окружения, запустите:

```bash
uvicorn app.main:app --reload
```

После запуска API будет доступно по адресу:

```text
http://127.0.0.1:8000
```

### Документация API

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```