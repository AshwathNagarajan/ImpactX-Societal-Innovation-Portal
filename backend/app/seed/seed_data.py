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
        "submitted_by": {"name": "Asha Devi", "email": "asha@example.com", "phone": "9999999999", "type": "Citizen"},
        "title": "Smart Water Leakage Detection for Rural Pipelines",
        "description": "Frequent unnoticed leakage in rural drinking water pipelines causes supply gaps, muddy water intrusion and tanker dependence across connected villages.",
        "category": "Water & Sanitation",
        "subcategory": "Pipeline monitoring",
        "district": "Ranchi",
        "city_or_village": "Ormanjhi",
        "location": "Cluster of villages near Ormanjhi block",
        "urgency": "HIGH",
        "people_affected": 18400,
        "existing_attempts": "Manual complaint registers are slow and leaks are usually found after visible damage.",
        "expected_impact": "Reduce water loss and improve reliable drinking water supply.",
        "attachments": [],
        "status": "VALIDATED",
        "priority": "HIGH",
        "progress": 62,
        "ai_analysis": {},
        "matched_institutes": [{"name": "Institute B - Water and Environment Center", "score": 91}],
        "assigned_institute_id": None,
        "industry_partners": [{"name": "Industry B - SensorWorks India"}],
    },
    {
        "challenge_id": "IMPX-2026-0002",
        "submitted_by": {"name": "Kisan Mitra Collective", "email": "kisan@example.com", "phone": "9888888888", "type": "Community Group"},
        "title": "AI-Based Crop Disease Detection for Small Farmers",
        "description": "Small farmers need early diagnosis of paddy and vegetable diseases in local languages without waiting for field officer visits.",
        "category": "Agriculture",
        "subcategory": "Crop health",
        "district": "East Singhbhum",
        "city_or_village": "Potka",
        "location": "Cluster of small farms near weekly mandi",
        "urgency": "HIGH",
        "people_affected": 9200,
        "existing_attempts": "Manual advisory visits are irregular.",
        "expected_impact": "Earlier disease identification and reduced crop loss.",
        "attachments": [],
        "status": "IN_DEVELOPMENT",
        "priority": "HIGH",
        "progress": 74,
        "ai_analysis": {},
        "matched_institutes": [{"name": "Institute A - AI Agriculture Lab", "score": 94}],
        "assigned_institute_id": None,
        "industry_partners": [{"name": "Industry A - Civic Cloud Labs"}],
    },
    {
        "challenge_id": "IMPX-2026-0003",
        "submitted_by": {"name": "Riverbank Youth Forum", "email": "river@example.com", "phone": "9777777777", "type": "Community Group"},
        "title": "Low-Cost Flood Warning System for Vulnerable Villages",
        "description": "Villages along low-lying river belts receive warnings too late, leaving households little time to move livestock, documents and medicines.",
        "category": "Disaster Management",
        "subcategory": "Early warning",
        "district": "Sahibganj",
        "city_or_village": "Rajmahal",
        "location": "Ganga riverbank settlement belt",
        "urgency": "CRITICAL",
        "people_affected": 31000,
        "existing_attempts": "Phone-tree alerts are inconsistent during heavy rain.",
        "expected_impact": "Earlier evacuation decisions and lower flood losses.",
        "attachments": [],
        "status": "ASSIGNED",
        "priority": "CRITICAL",
        "progress": 38,
        "ai_analysis": {},
        "matched_institutes": [{"name": "Institute C - Embedded Systems Lab", "score": 92}],
        "assigned_institute_id": None,
        "industry_partners": [{"name": "Industry B - SensorWorks India"}],
    },
]

ADDITIONAL_CHALLENGES = [
    ("IMPX-2026-0004", "Accessible Navigation System for Visually Impaired Citizens", "Accessibility", "Ranchi", "Ranchi", "PILOT", "HIGH", 4200),
    ("IMPX-2026-0005", "Rural Healthcare Appointment and Referral System", "Healthcare", "Dumka", "Jama", "VALIDATED", "MEDIUM", 26000),
    ("IMPX-2026-0006", "Smart Waste Segregation Monitoring", "Environment", "Dhanbad", "Dhanbad", "UNDER_REVIEW", "MEDIUM", 54000),
    ("IMPX-2026-0007", "Solar Cold Storage for Vegetable Producer Groups", "Livelihood", "Gumla", "Sisai", "SUBMITTED", "HIGH", 7600),
    ("IMPX-2026-0008", "School Attendance Risk Prediction for Remote Blocks", "Education", "Palamu", "Panki", "IMPLEMENTED", "MEDIUM", 11800),
    ("IMPX-2026-0009", "Low-Cost Arsenic Detection for Hand Pumps", "Water & Sanitation", "Deoghar", "Mohanpur", "ASSIGNED", "CRITICAL", 14500),
    ("IMPX-2026-0010", "IoT Monitoring for Anganwadi Nutrition Supplies", "Healthcare", "Giridih", "Bengabad", "IN_DEVELOPMENT", "HIGH", 17800),
    ("IMPX-2026-0011", "Road Damage Reporting and Prioritization System", "Infrastructure", "Bokaro", "Chas", "VALIDATED", "MEDIUM", 68000),
    ("IMPX-2026-0012", "Assistive Learning Kit for Children with Hearing Impairment", "Accessibility", "Hazaribagh", "Hazaribagh", "PILOT", "HIGH", 3600),
    ("IMPX-2026-0013", "Community Rainwater Recharge Planning Tool", "Environment", "Lohardaga", "Kuru", "SUBMITTED", "MEDIUM", 22400),
    ("IMPX-2026-0014", "Mobile Skill Marketplace for Returning Migrant Workers", "Livelihood", "Dumka", "Kathikund", "UNDER_REVIEW", "HIGH", 19100),
    ("IMPX-2026-0015", "Telemedicine Kiosk for Forest Fringe Villages", "Healthcare", "West Singhbhum", "Goilkera", "IMPLEMENTED", "CRITICAL", 27500),
]

for challenge_id, title, category, district, city, status, priority, affected in ADDITIONAL_CHALLENGES:
    CHALLENGES.append(
        {
            "challenge_id": challenge_id,
            "submitted_by": {"name": "Community Innovation Desk", "email": f"{challenge_id.lower()}@impactx.in", "phone": "9000000000", "type": "Community Group"},
            "title": title,
            "description": f"{title} is a verified civic innovation challenge requiring coordinated government, institute and industry support for scalable local impact.",
            "category": category,
            "subcategory": "Civic innovation",
            "district": district,
            "city_or_village": city,
            "location": f"{city}, {district}",
            "urgency": priority,
            "people_affected": affected,
            "existing_attempts": "Local teams have attempted manual coordination, but the process lacks data visibility and scalable implementation support.",
            "expected_impact": "Improve public service delivery, reduce community burden and create measurable social outcomes.",
            "attachments": [],
            "status": status,
            "priority": priority,
            "progress": 100 if status == "IMPLEMENTED" else 84 if status == "PILOT" else 58 if status == "IN_DEVELOPMENT" else 38 if status == "ASSIGNED" else 24 if status == "UNDER_REVIEW" else 16,
            "ai_analysis": {},
            "matched_institutes": [{"name": "Institute A - AI Agriculture Lab", "score": 86}],
            "assigned_institute_id": None,
            "industry_partners": [{"name": "Industry A - Civic Cloud Labs"}],
        }
    )

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

for index, challenge in enumerate(CHALLENGES[1:10], start=2):
    PROJECTS.append(
        {
            "project_id": f"PRJ-{index:04d}",
            "challenge_id": challenge["challenge_id"],
            "institute_id": "demo-institute",
            "industry_ids": [],
            "title": f"{challenge['title']} Solution Project",
            "status": ["RESEARCH", "PROTOTYPE", "TESTING", "PILOT", "ASSIGNED"][index % 5],
            "team": {"departments": ["CSE", "AI & DS", "ECE"], "students": 5 + index % 4},
            "mentor": ["Prof. Arvind Rao", "Dr. Kavita Sinha", "Dr. Farah Khan"][index % 3],
            "proposal": {
                "technology": [["IoT sensors"], ["Computer vision"], ["Mobile app"], ["Data analytics"], ["Low-cost hardware"]][index % 5],
                "required_support": [["Funding"], ["Technical Mentorship"], ["Equipment"], ["API / Cloud Credits"], ["Pilot Deployment"]][index % 5],
            },
            "progress": challenge.get("progress", 40),
            "prototype_status": "IN_PROGRESS",
            "pilot_status": "NOT_STARTED" if challenge["status"] not in {"PILOT", "IMPLEMENTED"} else "IN_PROGRESS",
            "implementation_status": "COMPLETED" if challenge["status"] == "IMPLEMENTED" else "NOT_STARTED",
            "impact_metrics": {"people_targeted": challenge["people_affected"], "pilot_villages": 2 + index % 5},
        }
    )

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

TEAMS = [
    {"project": "Flood Alert Mesh", "mentor": "Dr. Kavita Sinha", "students": 8, "departments": ["CSE", "ECE", "Civil"], "progress": 64},
    {"project": "Crop Doctor AI", "mentor": "Prof. Arvind Rao", "students": 6, "departments": ["AI & DS", "Biotechnology"], "progress": 78},
    {"project": "Solar Cold Chain", "mentor": "Dr. Farah Khan", "students": 7, "departments": ["Mechanical", "ECE"], "progress": 46},
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
    for item in TEAMS:
        await database.teams.update_one({"project": item["project"]}, {"$set": {**item, "updated_at": now}, "$setOnInsert": {"created_at": now}}, upsert=True)

    documents = load_documents()
    if documents:
        vector_store.build(documents)
    await close_mongo_connection()
    print("Seed data and RAG vector index generated.")


if __name__ == "__main__":
    asyncio.run(seed())
