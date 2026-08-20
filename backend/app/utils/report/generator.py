from pathlib import Path
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.utils.report.schemas import ReportData
from app.utils.report.styles import (
    BEIGE,
    BORDER,
    BROWN,
    GREEN,
    MUTED,
    NORMAL_STYLE,
    RED,
    TEXT,
    RIGHT_STYLE,
    SMALL_STYLE,
    SUBTITLE_STYLE,
    TITLE_STYLE,
    SummaryCard,
    TransferCard,
    WarningCard,
    money,
    section,
)


def build_header(data: ReportData) -> Table:
    meeting = data["meeting"]
    report = data["report"]

    left = [
        Paragraph("ИТОГОВЫЙ ОТЧЁТ", TITLE_STYLE),
        Spacer(1, 1.2 * mm),
        Paragraph(f'по встрече «{meeting["name"]}»', SUBTITLE_STYLE),
    ]

    brand_style = ParagraphStyle(
        "brand",
        fontName="ReportBold",
        fontSize=15,
        leading=18,
        alignment=TA_RIGHT,
        textColor=BROWN,
    )

    date_style = ParagraphStyle(
        "date",
        fontName="ReportBold",
        fontSize=7.2,
        leading=10,
        alignment=TA_RIGHT,
        textColor=TEXT,
    )

    right = [
        Paragraph("SplitUI", brand_style),
        Spacer(1, 1.5 * mm),
        Paragraph(f"Отчёт сформирован:<br/>{report['created_at']}", date_style),
    ]

    table = Table([[left, right]], colWidths=[112 * mm, 58 * mm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, -1), 0.6, BEIGE),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5 * mm),
            ]
        )
    )
    return table


def build_meeting_info(data: ReportData) -> Table:
    meeting = data["meeting"]

    cells = [
        Paragraph(f"<b>Период встречи</b><br/>{meeting['period']}", NORMAL_STYLE),
        Paragraph(
            f"<b>Участников</b><br/>{meeting['participants_count']} человека",
            NORMAL_STYLE,
        ),
        Paragraph(
            f"<b>ID встречи</b><br/><font size='6.5'>{meeting['meeting_id']}</font>",
            NORMAL_STYLE,
        ),
    ]

    table = Table([cells], colWidths=[58 * mm, 45 * mm, 67 * mm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
                ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
            ]
        )
    )
    return table


def build_participants(data: ReportData) -> Table:
    rows: list[list[Any]] = [["Участник", "Оплатил", "Его доля", "Итоговый баланс"]]

    for participant in data["participants"]:
        balance = participant["balance"]

        if balance > 0:
            balance_text = f'<font color="{GREEN.hexval()}"><b>+{money(balance)}</b></font>'
        elif balance < 0:
            balance_text = f'<font color="{RED.hexval()}"><b>-{money(abs(balance))}</b></font>'
        else:
            balance_text = money(0)

        rows.append(
            [
                Paragraph(f"<b>{participant['name']}</b>", NORMAL_STYLE),
                Paragraph(money(participant["paid"]), RIGHT_STYLE),
                Paragraph(money(participant["share"]), RIGHT_STYLE),
                Paragraph(balance_text, RIGHT_STYLE),
            ]
        )

    table = Table(
        rows,
        colWidths=[45 * mm, 40 * mm, 40 * mm, 45 * mm],
        repeatRows=1,
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BROWN),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "ReportBold"),
                ("FONTSIZE", (0, 0), (-1, 0), 7.2),
                ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("LEFTPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ]
        )
    )
    return table


def build_expenses(data: ReportData) -> Table:
    rows: list[list[Any]] = [
        ["Дата", "Название", "Оплатил", "Категория", "Сумма", "Статус"]
    ]

    for expense in data["expenses"]:
        if expense["confirmed"]:
            status = f'<font color="{GREEN.hexval()}"><b>Подтверждён</b></font>'
        else:
            status = f'<font color="{RED.hexval()}"><b>Не подтверждён</b></font>'

        rows.append(
            [
                Paragraph(expense["date"], SMALL_STYLE),
                Paragraph(expense["name"], NORMAL_STYLE),
                Paragraph(expense["payer"], NORMAL_STYLE),
                Paragraph(expense["category"], NORMAL_STYLE),
                Paragraph(money(expense["amount"]), RIGHT_STYLE),
                Paragraph(status, SMALL_STYLE),
            ]
        )

    table = Table(
        rows,
        colWidths=[23 * mm, 39 * mm, 27 * mm, 31 * mm, 26 * mm, 24 * mm],
        repeatRows=1,
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BROWN),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "ReportBold"),
                ("FONTSIZE", (0, 0), (-1, 0), 6.5),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 1.8 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1.8 * mm),
                ("LEFTPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (4, 0), (4, -1), "RIGHT"),
            ]
        )
    )
    return table



def draw_footer(canvas, doc) -> None:
    canvas.saveState()
    page_width, _ = A4

    canvas.setStrokeColor(BEIGE)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 14 * mm, page_width - 20 * mm, 14 * mm)

    canvas.setFont("ReportRegular", 6.7)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 8.5 * mm, "SplitUI — делим расходы легко")

    report_id = getattr(doc, "report_id", None)
    if report_id:
        canvas.drawCentredString(page_width / 2, 8.5 * mm, f"ID отчёта: {report_id}")

    canvas.drawRightString(page_width - 20 * mm, 8.5 * mm, f"Страница {doc.page}")
    canvas.restoreState()


def generate_report(
    data: ReportData,
    filename: str = "report.pdf",
):
    filename = Path(filename)

    doc = SimpleDocTemplate(
        str(filename),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=13 * mm,
        bottomMargin=20 * mm,
        title="Итоговый отчёт SplitUI",
        author="SplitUI",
    )

    doc.report_id = data["report"]["report_id"]
    story: list[Any] = []

    story.append(build_header(data))
    story.append(Spacer(1, 3 * mm))

    story.append(build_meeting_info(data))
    story.append(Spacer(1, 2 * mm))

    summary = data["summary"]
    story.append(
        SummaryCard(
            total=summary["total_expenses"],
            average=summary["average_expense"],
            checks_count=summary["checks_count"],
            status=summary["status"],
        )
    )
    story.append(Spacer(1, 4 * mm))

    if data["warnings"]:
        story.append(WarningCard(data["warnings"]))
        story.append(Spacer(1, 4.5 * mm))

    transfers_block: list[Any] = [
        section("Кому и сколько нужно перевести"),
        Spacer(1, 3 * mm),
    ]

    if data["transfers"]:
        for index, transfer in enumerate(data["transfers"]):
            transfers_block.append(
                TransferCard(
                    sender=transfer["from"],
                    receiver=transfer["to"],
                    amount=transfer["amount"],
                )
            )
            if index != len(data["transfers"]) - 1:
                transfers_block.append(Spacer(1, 1.5 * mm))

        transfers_block.extend(
            [
                Spacer(1, 2.5 * mm),
                Paragraph(
                    "После выполнения этих переводов итоговый баланс "
                    "всех участников станет равным 0 ₽.",
                    SMALL_STYLE,
                ),
            ]
        )
    else:
        transfers_block.append(
            Paragraph(
                "Расчёты завершены. Дополнительные переводы не требуются.",
                NORMAL_STYLE,
            )
        )

    story.append(KeepTogether(transfers_block))
    story.append(Spacer(1, 5 * mm))

    # Participants
    participants_block = [
        section("Баланс участников"),
        Spacer(1, 3 * mm),
        build_participants(data),
    ]
    story.append(KeepTogether(participants_block))
    story.append(Spacer(1, 5 * mm))

    expenses_block = [
        section("Список расходов"),
        Spacer(1, 3 * mm),
        build_expenses(data),
    ]
    story.append(KeepTogether(expenses_block))

    doc.build(
        story,
        onFirstPage=draw_footer,
        onLaterPages=draw_footer,
    )

    return filename