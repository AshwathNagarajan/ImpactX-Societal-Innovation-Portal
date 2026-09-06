import csv
import io

from fastapi import APIRouter, Depends, Response

from app.core.database import get_database
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/exports", tags=["Exports"], dependencies=[Depends(get_current_user)])


def _csv_response(filename: str, rows: list[dict], fields: list[str]) -> Response:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow({field: row.get(field, "") for field in fields})
    return Response(
        output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _pdf_response(filename: str, title: str, lines: list[str]) -> Response:
    content_lines = [title, "", *lines]
    stream_parts = ["BT /F1 18 Tf 72 760 Td"]
    for index, line in enumerate(content_lines):
        safe = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        stream_parts.append(f"({safe}) Tj")
        if index < len(content_lines) - 1:
            stream_parts.append("0 -24 Td")
    stream_parts.append("ET")
    stream = "\n".join(stream_parts).encode("latin-1", errors="replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = []
    for number, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{number} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")
    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
    for offset in offsets:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode())
    return Response(
        bytes(pdf),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/challenges.csv")
async def challenges_csv():
    rows = [item async for item in get_database().challenges.find({}).sort("created_at", -1)]
    fields = ["challenge_id", "title", "category", "priority", "status", "district", "people_affected", "created_at"]
    return _csv_response("impactx-challenges.csv", rows, fields)


@router.get("/projects.csv")
async def projects_csv():
    rows = [item async for item in get_database().projects.find({}).sort("updated_at", -1)]
    fields = ["project_id", "title", "status", "challenge_id", "institute_name", "funding_amount", "updated_at"]
    return _csv_response("impactx-projects.csv", rows, fields)


@router.get("/impact.pdf")
async def impact_pdf():
    database = get_database()
    challenges = await database.challenges.count_documents({})
    projects = await database.projects.count_documents({})
    implemented = await database.projects.count_documents({"status": {"$in": ["IMPLEMENTATION", "IMPACT_REVIEW", "CLOSED"]}})
    citizens = 0
    async for challenge in database.challenges.find({}, {"people_affected": 1}):
        citizens += int(challenge.get("people_affected") or 0)
    return _pdf_response(
        "impactx-impact-summary.pdf",
        "IMPACTX Impact Summary",
        [
            f"Total challenges: {challenges}",
            f"Active projects: {projects}",
            f"Implemented or reviewed projects: {implemented}",
            f"Estimated citizens impacted: {citizens}",
        ],
    )
