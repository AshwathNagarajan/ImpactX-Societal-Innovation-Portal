import asyncio
from datetime import datetime, timezone

from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.core.security import hash_password
from app.rag.document_loader import load_documents
from app.rag.vector_store import vector_store


DEMO_USERS = [
    {"name": "Admin User", "email": "admin@impactx.in", "password": "admin123", "role": "ADMIN"},
    {"name": "BIT Mesra Innovation Cell", "email": "institute@impactx.in", "password": "institute123", "role": "INSTITUTE"},
    {"name": "Tata Steel Foundation", "email": "industry@impactx.in", "password": "industry123", "role": "INDUSTRY"},
]

INSTITUTES = [
    {
        "name": "Institute A - AI Agriculture Lab",
        "departments": ["Computer Science", "AI & Data Science", "Biotechnology"],
        "expertise": ["AI", "Data Science", "Computer Vision", "Agriculture Technology"],
        "research_domains": ["Crop disease detection", "Remote advisory systems"],
        "facilities": ["GPU lab", "Field validation network"],
        "previous_projects": ["Leaf image disease classifier", "Farmer advisory chatbot"],
        "district": "Ranchi",
        "availability": True,
    },
    {
        "name": "Institute B - Water and Environment Center",
        "departments": ["Civil Engineering", "Environmental Engineering"],
        "expertise": ["Water Management", "Sanitation", "Environmental Monitoring"],
        "research_domains": ["Pipeline leakage", "Water quality sensing"],
        "facilities": ["Hydrology lab", "Community survey unit"],
        "previous_projects": ["Low-cost leak detection", "Water testing kits"],
        "district": "Dhanbad",
        "availability": True,
    },
    {
        "name": "Institute C - Embedded Systems Lab",
        "departments": ["Electronics", "IoT", "Mechanical"],
        "expertise": ["Embedded Systems", "IoT", "Disaster Monitoring", "Sensors"],
        "research_domains": ["Flood warning", "Low-power sensor networks"],
        "facilities": ["PCB fabrication", "Sensor calibration"],
        "previous_projects": ["River-level alert node", "Solar telemetry station"],
        "district": "Sahibganj",
        "availability": True,
    },
]

INDUSTRIES = [
    {
        "name": "Industry A - Civic Cloud Labs",
        "sector": "Technology",
        "expertise": ["Cloud", "AI", "Data Analytics"],
        "technologies": ["Model hosting", "Dashboards", "APIs"],
        "support_types": ["Cloud Credits", "Technical Mentorship"],
        "csr_domains": ["Education", "Agriculture", "Health"],
        "previous_projects": ["District analytics platform"],
        "locations": ["Ranchi", "Jamshedpur"],
    },
    {
        "name": "Industry B - SensorWorks India",
        "sector": "Hardware",
        "expertise": ["IoT", "Sensors", "Hardware Prototyping"],
        "technologies": ["LoRa", "Water sensors", "Embedded boards"],
        "support_types": ["Equipment", "Prototype Support", "Pilot Support"],
        "csr_domains": ["Water", "Disaster Management"],
        "previous_projects": ["Flood sensor pilot"],
        "locations": ["Dhanbad", "Sahibganj"],
    },
    {
        "name": "Industry C - Social Impact Manufacturing",
        "sector": "Manufacturing",
        "expertise": ["Manufacturing", "Pilot Deployment", "CSR Funding"],
        "technologies": ["Tooling", "Low-cost fabrication"],
        "support_types": ["Manufacturing", "Funding", "Market Access"],
        "csr_domains": ["Livelihood", "Accessibility"],
        "previous_projects": ["Assistive device scale-up"],
        "locations": ["Ranchi", "Dumka"],
    },
]

CHALLENGES = [
    {
        "challenge_id": "IMPX-2026-0001",
        "submitted_by": {"name": "Asha Kumari", "email": "asha@example.com", "phone": "9999999999", "type": "Citizen"},
        "title": "AI-Based Crop Disease Detection for Small Farmers",
        "description": "Small farmers need low-cost image-based crop disease detection for paddy and vegetable crops.",
        "category": "Agriculture",
        "subcategory": "Crop Health",
        "district": "East Singhbhum",
        "city_or_village": "Ghatsila",
        "location": "Cluster of small farms near weekly mandi",
        "urgency": "HIGH",
        "people_affected": 5200,
        "existing_attempts": "Manual advisory visits are irregular.",
        "expected_impact": "Earlier disease identification and reduced crop loss.",
        "attachments": [],
        "status": "SUBMITTED",
        "priority": "HIGH",
        "ai_analysis": {},
        "matched_institutes": [],
        "assigned_institute_id": None,
        "industry_partners": [],
    }
]

PROJECTS = [
    {
        "project_id": "PRJ-0001",
        "challenge_id": "IMPX-2026-0001",
        "institute_id": "demo-institute",
        "industry_ids": [],
        "title": "Crop Doctor AI Field Prototype",
        "status": "PROTOTYPE",
        "team": {"departments": ["AI & Data Science", "Biotechnology"], "students": 6},
        "mentor": "Prof. Arvind Rao",
        "proposal": {
            "technology": ["Computer Vision", "Mobile Application", "Field Advisory Dashboard"],
            "required_support": ["Cloud Credits", "Technical Mentorship", "Pilot Support"],
        },
        "progress": 54,
        "prototype_status": "IN_PROGRESS",
        "pilot_status": "NOT_STARTED",
        "implementation_status": "NOT_STARTED",
        "impact_metrics": {"people_targeted": 5200, "pilot_villages": 3},
    }
]

MILESTONES = [
    {
        "milestone_id": "MS-0001",
        "project_id": "PRJ-0001",
        "title": "Field Dataset Collection",
        "description": "Collect crop image samples and farmer advisory requirements.",
        "stage": "RESEARCH",
        "assigned_to": "AI & DS Team",
        "status": "COMPLETED",
        "completion_percentage": 100,
        "deliverables": ["Dataset register", "Field survey note"],
        "evidence": [],
        "review_comments": "Approved for prototype phase.",
    },
    {
        "milestone_id": "MS-0002",
        "project_id": "PRJ-0001",
        "title": "Prototype Advisory App",
        "description": "Build disease detection and advisory workflow for pilot testing.",
        "stage": "PROTOTYPE",
        "assigned_to": "CSE Prototype Team",
        "status": "IN_PROGRESS",
        "completion_percentage": 45,
        "deliverables": ["Prototype APK", "Model evaluation report"],
        "evidence": [],
        "review_comments": "",
    },
]


async def seed() -> None:
    await connect_to_mongo()
    database = get_database()
    now = datetime.now(timezone.utc)

    for user in DEMO_USERS:
        await database.users.update_one(
            {"email": user["email"]},
            {
                "$set": {
                    "name": user["name"],
                    "email": user["email"],
                    "password_hash": hash_password(user["password"]),
                    "role": user["role"],
                    "is_active": True,
                    "updated_at": now,
                },
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )

    for item in INSTITUTES:
        await database.institutes.update_one({"name": item["name"]}, {"$set": {**item, "updated_at": now}, "$setOnInsert": {"created_at": now}}, upsert=True)
    for item in INDUSTRIES:
        await database.industries.update_one({"name": item["name"]}, {"$set": {**item, "updated_at": now}, "$setOnInsert": {"created_at": now}}, upsert=True)
    for item in CHALLENGES:
        await database.challenges.update_one({"challenge_id": item["challenge_id"]}, {"$set": {**item, "updated_at": now}, "$setOnInsert": {"created_at": now}}, upsert=True)
    for item in PROJECTS:
        await database.projects.update_one({"project_id": item["project_id"]}, {"$set": {**item, "updated_at": now}, "$setOnInsert": {"created_at": now}}, upsert=True)
    for item in MILESTONES:
        await database.milestones.update_one({"milestone_id": item["milestone_id"]}, {"$set": {**item, "updated_at": now}, "$setOnInsert": {"created_at": now}}, upsert=True)

    documents = load_documents()
    if documents:
        vector_store.build(documents)
    await close_mongo_connection()
    print("Seed data and RAG vector index generated.")


if __name__ == "__main__":
    asyncio.run(seed())
