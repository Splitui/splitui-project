from typing import TypedDict


class MeetingReport(TypedDict):
    name: str
    period: str
    participants_count: int
    meeting_id: str


class ReportInfo(TypedDict):
    created_at: str
    report_id: str


class ReportSummary(TypedDict):
    total_expenses: float
    average_expense: float
    checks_count: int
    status: str


class ReportWarning(TypedDict):
    type: str
    text: str


class ReportTransfer(TypedDict):
    from_: str
    to: str
    amount: float


class ReportParticipant(TypedDict):
    name: str
    paid: float
    share: float
    balance: float


class ReportExpense(TypedDict):
    date: str
    name: str
    payer: str
    category: str
    amount: float
    confirmed: bool


class ReportData(TypedDict):
    meeting: MeetingReport
    report: ReportInfo
    summary: ReportSummary
    warnings: list[ReportWarning]
    transfers: list[ReportTransfer]
    participants: list[ReportParticipant]
    expenses: list[ReportExpense]