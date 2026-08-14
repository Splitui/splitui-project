from fastapi import HTTPException

def validate_unique(item,title,message):

    """
    Проверяет, что последовательность не содержит повторов.

    :param item: проверяемая последовательность значений.
    :param title: название объекта для сообщения об ошибке.
    :param message: текст сообщения об ошибке.
    :raises HTTPException: если в последовательности найдены повторы.
    """

    unique_item = set(item)

    if len(unique_item) != len(item):
        raise HTTPException(
            status_code=400,
            detail={
                "message": message,
                "item": title
            },
        )

def check_missing_and_return_error(first,second,message,status_code = 400):

    """
    Проверяет, что все запрошенные значения входят в допустимое множество.

    :param first: множество проверяемых значений.
    :param second: множество допустимых значений.
    :param message: текст сообщения об ошибке.
    :param status_code: HTTP-статус ошибки.
    """

    missing = first - second
    if missing:
        raise HTTPException(
            status_code=status_code,
            detail={
                "message": message,
                "missing": sorted(
                    missing
                ),
            }
        )

def validate_receipt_belongs_to_meeting(reciept,meeting_id):

    """
    Проверяет существование чека и его принадлежность встрече.

    :param receipt: данные проверяемого чека или None.
    :param meeting_id: идентификатор ожидаемой встречи.
    """

    if reciept is None:
        raise HTTPException(
            status_code=404,
            detail="Чек не найден в указанной встрече",
        )
    if reciept["meeting_id"] != meeting_id:
        raise HTTPException(
                    status_code=403,
                    detail="Чек принадлежит другой встрече",
                )