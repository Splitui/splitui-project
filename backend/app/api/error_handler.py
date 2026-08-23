from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

def get_validation_message(error: dict) -> str:
    error_type = error["type"]
    context = error.get("ctx", {})

    messages = {
        "missing": "Поле обязательно",
        "string_too_short": (
            f"Минимальная длина: {context.get('min_length')}"
        ),
        "string_too_long": (
            f"Максимальная длина: {context.get('max_length')}"
        ),
        "greater_than": (
            f"Значение должно быть больше {context.get('gt')}"
        ),
        "greater_than_equal": (
            f"Значение должно быть не меньше {context.get('ge')}"
        ),
        "int_parsing": "Ожидается целое число",
        "decimal_parsing": "Ожидается число",
        "datetime_from_date_parsing": "Некорректная дата",
        "datetime_parsing": "Некорректная дата",
    }

    if error_type == "value_error":
        return error["msg"].removeprefix("Value error, ")

    return messages.get(
        error_type,
        "Некорректное значение",
    )

async def validation_exception_handler(
    request,
    exception,
):
    messages = []

    for error in exception.errors():
        field = str(error["loc"][-1])
        message = get_validation_message(error)
        messages.append(f"{field}: {message}")

    return JSONResponse(
        status_code=422,
        content={
            "detail": "\n".join(messages),
        },
    )

def register_validation_error_handler(app):
    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,
    )
