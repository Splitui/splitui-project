from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Flowable, Paragraph

BROWN = colors.HexColor("#463628")
BROWN_SOFT = colors.HexColor("#765D46")
TEXT = colors.HexColor("#24211E")
MUTED = colors.HexColor("#77716B")
LIGHT_BEIGE = colors.HexColor("#FBF8F3")
BEIGE = colors.HexColor("#E7D8C6")
BORDER = colors.HexColor("#DED6CC")
GREEN = colors.HexColor("#147A42")
GREEN_BORDER = colors.HexColor("#78B58D")
LIGHT_GREEN = colors.HexColor("#EAF6EE")
RED = colors.HexColor("#C73832")
RED_ICON = colors.HexColor("#E34B44")
RED_BORDER = colors.HexColor("#F0B1AE")
LIGHT_RED = colors.HexColor("#FFF5F4")

def register_fonts() -> None:
    """Регистрирует шрифты, используемые при формировании отчёта."""
    fonts_dir = Path(__file__).resolve().parent / "assets" / "fonts"

    pdfmetrics.registerFont(
        TTFont(
            "ReportRegular",
            str(fonts_dir / "DejaVuSans.ttf"),
            shapable=False,
        )
    )
    pdfmetrics.registerFont(
        TTFont(
            "ReportBold",
            str(fonts_dir / "DejaVuSans-Bold.ttf"),
            shapable=False,
        )
    )

    pdfmetrics.registerFontFamily(
        "ReportRegular",
        normal="ReportRegular",
        bold="ReportBold",
        italic="ReportRegular",
        boldItalic="ReportBold",
    )


register_fonts()

TITLE_STYLE = ParagraphStyle(
    "title",
    fontName="ReportBold",
    fontSize=22,
    leading=26,
    textColor=BROWN,
)

SUBTITLE_STYLE = ParagraphStyle(
    "subtitle",
    fontName="ReportRegular",
    fontSize=10.5,
    leading=14,
    textColor=MUTED,
)

SECTION_STYLE = ParagraphStyle(
    "section",
    fontName="ReportBold",
    fontSize=12,
    leading=15,
    textColor=TEXT,
)

NORMAL_STYLE = ParagraphStyle(
    "normal",
    fontName="ReportRegular",
    fontSize=8.5,
    leading=12,
    textColor=TEXT,
)

SMALL_STYLE = ParagraphStyle(
    "small",
    fontName="ReportRegular",
    fontSize=7.5,
    leading=10,
    textColor=MUTED,
)

RIGHT_STYLE = ParagraphStyle(
    "right",
    parent=NORMAL_STYLE,
    alignment=TA_RIGHT,
)


def money(value: float | int) -> str:
    result = f"{value:,.2f}".replace(",", " ").replace(".", ",")
    return f"{result} ₽"


def section(title: str) -> Paragraph:
    return Paragraph(title, SECTION_STYLE)


class SummaryCard(Flowable):
    """Сводка: сумма, средний расход, количество чеков, статус."""

    def __init__(
        self,
        total: float,
        average: float,
        checks_count: int,
        status: str,
        width: float = 170 * mm,
    ) -> None:
        super().__init__()
        self.total = total
        self.average = average
        self.checks_count = checks_count
        self.status = status
        self.width = width
        self.height = 24 * mm

    def draw(self) -> None:
        c = self.canv

        c.setFillColor(LIGHT_BEIGE)
        c.setStrokeColor(BEIGE)
        c.setLineWidth(0.7)
        c.roundRect(0, 0, self.width, self.height, 3 * mm, fill=1, stroke=1)

        # Разделитель перед статусом.
        c.setStrokeColor(BEIGE)
        c.line(120 * mm, 4 * mm, 120 * mm, self.height - 4 * mm)

        columns = [0 * mm, 44 * mm, 88 * mm, 120 * mm]
        labels = [
            "Всего расходов",
            "Средний расход",
            "Чеков",
            "Статус расчётов",
        ]
        values = [money(self.total), money(self.average), f"{self.checks_count} шт.", None]

        for i, x in enumerate(columns):
            c.setFillColor(MUTED)
            c.setFont("ReportRegular", 7)
            c.drawString(x + 5 * mm, 16.5 * mm, labels[i])

            if values[i] is not None:
                c.setFillColor(TEXT)
                c.setFont("ReportBold", 14)
                c.drawString(x + 5 * mm, 7 * mm, values[i])

        # Зелёный badge.
        badge_x = 126 * mm
        badge_y = 6 * mm
        badge_w = 38 * mm
        badge_h = 9 * mm

        c.setFillColor(LIGHT_GREEN)
        c.setStrokeColor(GREEN_BORDER)
        c.roundRect(badge_x, badge_y, badge_w, badge_h, 4 * mm, fill=1, stroke=1)

        circle_x = badge_x + 5 * mm
        circle_y = badge_y + badge_h / 2

        c.setStrokeColor(GREEN)
        c.setLineWidth(0.9)
        c.circle(circle_x, circle_y, 2 * mm, fill=0, stroke=1)
        c.line(circle_x - 1.0 * mm, circle_y, circle_x - 0.2 * mm, circle_y - 0.8 * mm)
        c.line(circle_x - 0.2 * mm, circle_y - 0.8 * mm, circle_x + 1.1 * mm, circle_y + 0.8 * mm)

        c.setFillColor(GREEN)
        c.setFont("ReportBold", 6.1)
        c.drawString(badge_x + 9 * mm, badge_y + 3.1 * mm, self.status.upper())


class WarningCard(Flowable):
    """Красный блок предупреждений с простыми векторными иконками."""

    def __init__(
        self,
        warnings: list[dict[str, str]],
        width: float = 170 * mm,
    ) -> None:
        super().__init__()
        self.warnings = warnings
        self.width = width
        self.height = 31 * mm

    def draw(self) -> None:
        c = self.canv

        c.setFillColor(LIGHT_RED)
        c.setStrokeColor(RED_BORDER)
        c.setLineWidth(0.7)
        c.roundRect(0, 0, self.width, self.height, 3 * mm, fill=1, stroke=1)

        c.setFillColor(RED)
        c.setFont("ReportBold", 8.5)
        c.drawString(5 * mm, 22.5 * mm, "Требует внимания")

        y = 14.5 * mm

        for warning in self.warnings[:2]:
            warning_type = warning.get("type", "info")
            text = warning.get("text", "")

            if warning_type == "warning":
                c.setFillColor(RED_ICON)
                c.circle(7 * mm, y + 1 * mm, 2.3 * mm, fill=1, stroke=0)
                c.setFillColor(colors.white)
                c.setFont("ReportBold", 6.5)
                c.drawCentredString(7 * mm, y - 0.4 * mm, "!")
            else:
                c.setStrokeColor(MUTED)
                c.setFillColor(colors.white)
                c.circle(7 * mm, y + 1 * mm, 2.3 * mm, fill=1, stroke=1)
                c.setFillColor(MUTED)
                c.setFont("ReportBold", 6.2)
                c.drawCentredString(7 * mm, y - 0.3 * mm, "i")

            c.setFillColor(TEXT)
            c.setFont("ReportRegular", 7.8)
            c.drawString(13 * mm, y, text)
            y -= 8 * mm


class TransferCard(Flowable):
    """Одна строка перевода как отдельная закруглённая карточка."""

    def __init__(
        self,
        sender: str,
        receiver: str,
        amount: float,
        width: float = 170 * mm,
    ) -> None:
        super().__init__()
        self.sender = sender
        self.receiver = receiver
        self.amount = amount
        self.width = width
        self.height = 15 * mm

    def draw(self) -> None:
        c = self.canv

        c.setFillColor(LIGHT_BEIGE)
        c.setStrokeColor(BEIGE)
        c.setLineWidth(0.7)
        c.roundRect(0, 0, self.width, self.height, 3 * mm, fill=1, stroke=1)

        baseline = 5.4 * mm

        c.setFillColor(TEXT)
        c.setFont("ReportBold", 9)
        c.drawString(5 * mm, baseline, self.sender)

        c.setFillColor(BROWN_SOFT)
        c.setFont("ReportRegular", 14)
        c.drawCentredString(58 * mm, baseline - 0.4 * mm, "→")

        c.setFillColor(TEXT)
        c.setFont("ReportBold", 9)
        c.drawString(72 * mm, baseline, self.receiver)

        c.setFillColor(GREEN)
        c.setFont("ReportBold", 9.5)
        c.drawRightString(self.width - 5 * mm, baseline, money(self.amount))
