from pathlib import Path
from tempfile import TemporaryDirectory
from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.engine import Connection

from app.api.dependencies import get_meeting_for_participant
from app.db.dependencies import get_connection
from app.services.meetings_service import get_meeting_or_error
from app.services.report_service import create_meeting_report


router = APIRouter(
    prefix="",
    tags=["Отчёты"],
)


@router.get(
    "/meetings/{meeting_uuid}/report",
    summary="Скачать итоговый отчёт встречи",
    response_class=Response,
)
def download_meeting_report(
    meeting_uuid: UUID,
    connection: Connection = Depends(get_connection),
):
    """Формирует и возвращает PDF-отчёт встречи.

    :param meeting_uuid: UUID встречи.
    :param meeting: данные доступной участнику встречи.
    :param connection: соединение с базой данных.
    :return: итоговый отчёт в формате PDF.
    """

    get_meeting_or_error(connection,meeting_uuid)

    with TemporaryDirectory() as temporary_directory:
        output_path = (
            Path(temporary_directory)
            / "meeting-report.pdf"
        )

        report_path = create_meeting_report(
            connection=connection,
            meeting_uuid=meeting_uuid,
            output_path=output_path,
        )

        report_content = report_path.read_bytes()

    return Response(
        content=report_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                'attachment; filename="meeting-report.pdf"'
            ),
        },
    )