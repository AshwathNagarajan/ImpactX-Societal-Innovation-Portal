export const categories = ["Agriculture", "Healthcare", "Education", "Water & Sanitation", "Environment", "Infrastructure", "Accessibility", "Livelihood", "Disaster Management"];
export const districts = ["Ranchi", "East Singhbhum", "Sahibganj", "Dumka", "Dhanbad", "Bokaro", "Hazaribagh", "Palamu", "Deoghar", "Giridih", "Lohardaga", "Gumla"];
export const statuses = ["Submitted", "Under Review", "Validated", "Assigned", "In Development", "Pilot Testing", "Implemented"];
export const priorities = ["Low", "Medium", "High", "Critical"];

export const kpis = [
  ["Total Challenges", "1,248", "12.4% this quarter"], ["Validated Challenges", "824", "66% validation rate"],
  ["Active Projects", "176", "48 in prototype"], ["Solutions Implemented", "93", "31 districts piloted"],
  ["Partner Institutes", "64", "312 faculty mentors"], ["Industry Partners", "41", "CSR + product teams"],
  ["Districts Covered", "24", "Jharkhand pilot"], ["Citizens Impacted", "2.4L+", "verified reach"]
];

export const challenges = [
  { id: "IMPX-2026-0001", title: "Smart Water Leakage Detection for Rural Pipelines", category: "Water & Sanitation", subCategory: "Pipeline monitoring", district: "Ranchi", city: "Ormanjhi", date: "2026-08-21", status: "Validated", priority: "High", affected: 18400, institutes: 5, industries: 3, submitter: "Asha Devi, Ward Committee", description: "Frequent unnoticed leakage in rural drinking water pipelines causes supply gaps, muddy water intrusion and tanker dependence across connected villages.", progress: 62 },
  { id: "IMPX-2026-0002", title: "AI-Based Crop Disease Detection for Small Farmers", category: "Agriculture", subCategory: "Crop health", district: "East Singhbhum", city: "Potka", date: "2026-08-19", status: "In Development", priority: "High", affected: 9200, institutes: 8, industries: 4, submitter: "Kisan Mitra Collective", description: "Small farmers need early diagnosis of paddy and vegetable diseases in local languages without waiting for field officer visits.", progress: 74 },
  { id: "IMPX-2026-0003", title: "Low-Cost Flood Warning System for Vulnerable Villages", category: "Disaster Management", subCategory: "Early warning", district: "Sahibganj", city: "Rajmahal", date: "2026-08-15", status: "Assigned", priority: "Critical", affected: 31000, institutes: 6, industries: 5, submitter: "Riverbank Youth Forum", description: "Villages along low-lying river belts receive warnings too late, leaving households little time to move livestock, documents and medicines.", progress: 38 },
  { id: "IMPX-2026-0004", title: "Accessible Navigation System for Visually Impaired Citizens", category: "Accessibility", subCategory: "Mobility", district: "Ranchi", city: "Ranchi", date: "2026-08-11", status: "Pilot Testing", priority: "High", affected: 4200, institutes: 7, industries: 2, submitter: "Netra Sahayata Kendra", description: "Public offices and bus terminals lack audio navigation support for visually impaired visitors.", progress: 84 },
  { id: "IMPX-2026-0005", title: "Rural Healthcare Appointment and Referral System", category: "Healthcare", subCategory: "Access", district: "Dumka", city: "Jama", date: "2026-08-09", status: "Validated", priority: "Medium", affected: 26000, institutes: 4, industries: 2, submitter: "ASHA Network Dumka", description: "Patients travel to district hospitals without confirmed appointments or referral documents, increasing waiting time and costs.", progress: 44 },
  { id: "IMPX-2026-0006", title: "Smart Waste Segregation Monitoring", category: "Environment", subCategory: "Urban waste", district: "Dhanbad", city: "Dhanbad", date: "2026-08-07", status: "Under Review", priority: "Medium", affected: 54000, institutes: 3, industries: 2, submitter: "Resident Welfare Federation", description: "Door-to-door collection teams need low-cost monitoring and incentives to improve wet/dry waste segregation compliance.", progress: 22 },
  { id: "IMPX-2026-0007", title: "Solar Cold Storage for Vegetable Producer Groups", category: "Livelihood", subCategory: "Post-harvest", district: "Gumla", city: "Sisai", date: "2026-08-02", status: "Submitted", priority: "High", affected: 7600, institutes: 4, industries: 3, submitter: "Mahila Producer Company", description: "Farmers lose value because leafy vegetables and tomatoes spoil before aggregation vehicles arrive.", progress: 16 },
  { id: "IMPX-2026-0008", title: "School Attendance Risk Prediction for Remote Blocks", category: "Education", subCategory: "Retention", district: "Palamu", city: "Panki", date: "2026-07-30", status: "Implemented", priority: "Medium", affected: 11800, institutes: 6, industries: 1, submitter: "Block Education Office", description: "Teachers need an early signal for students at risk of dropping out due to migration, illness or transport barriers.", progress: 100 },
  { id: "IMPX-2026-0009", title: "Low-Cost Arsenic Detection for Hand Pumps", category: "Water & Sanitation", subCategory: "Water quality", district: "Deoghar", city: "Mohanpur", date: "2026-07-27", status: "Assigned", priority: "Critical", affected: 14500, institutes: 5, industries: 2, submitter: "Village Health Committee", description: "Households need routine, affordable water quality alerts before contamination causes long-term health issues.", progress: 41 },
  { id: "IMPX-2026-0010", title: "IoT Monitoring for Anganwadi Nutrition Supplies", category: "Healthcare", subCategory: "Nutrition", district: "Giridih", city: "Bengabad", date: "2026-07-23", status: "In Development", priority: "High", affected: 17800, institutes: 3, industries: 3, submitter: "Nutrition Mission Cell", description: "Nutrition supplies face stockouts and delayed redistribution across remote Anganwadi centers.", progress: 58 },
  { id: "IMPX-2026-0011", title: "Road Damage Reporting and Prioritization System", category: "Infrastructure", subCategory: "Road maintenance", district: "Bokaro", city: "Chas", date: "2026-07-20", status: "Validated", priority: "Medium", affected: 68000, institutes: 4, industries: 1, submitter: "Transport Users Association", description: "Citizens need a transparent way to report dangerous road patches and see repair prioritization.", progress: 35 },
  { id: "IMPX-2026-0012", title: "Assistive Learning Kit for Children with Hearing Impairment", category: "Accessibility", subCategory: "Inclusive education", district: "Hazaribagh", city: "Hazaribagh", date: "2026-07-18", status: "Pilot Testing", priority: "High", affected: 3600, institutes: 7, industries: 2, submitter: "Inclusive Schools Network", description: "Teachers require captioning, visual prompts and assessment support for children with hearing impairment.", progress: 88 },
  { id: "IMPX-2026-0013", title: "Community Rainwater Recharge Planning Tool", category: "Environment", subCategory: "Groundwater", district: "Lohardaga", city: "Kuru", date: "2026-07-13", status: "Submitted", priority: "Medium", affected: 22400, institutes: 2, industries: 1, submitter: "Gram Sabha Kuru", description: "Villages need simple decision support to identify recharge points using terrain, land and seasonal water data.", progress: 12 },
  { id: "IMPX-2026-0014", title: "Mobile Skill Marketplace for Returning Migrant Workers", category: "Livelihood", subCategory: "Employment", district: "Dumka", city: "Kathikund", date: "2026-07-09", status: "Under Review", priority: "High", affected: 19100, institutes: 3, industries: 4, submitter: "Migrant Resource Center", description: "Returning workers struggle to connect verified skills with local contractors, SHGs and small manufacturers.", progress: 24 },
  { id: "IMPX-2026-0015", title: "Telemedicine Kiosk for Forest Fringe Villages", category: "Healthcare", subCategory: "Primary care", district: "West Singhbhum", city: "Goilkera", date: "2026-07-04", status: "Implemented", priority: "Critical", affected: 27500, institutes: 5, industries: 3, submitter: "Community Health Federation", description: "Forest fringe communities travel several hours for routine consultation, follow-ups and medicine guidance.", progress: 100 }
];

export const institutes = [
  { name: "BIT Mesra", expertise: "IoT, AI, Civil Systems", score: 94, projects: 18, availability: "High" },
  { name: "IIT ISM Dhanbad", expertise: "Sensors, Mining Safety, Analytics", score: 91, projects: 22, availability: "Medium" },
  { name: "NIT Jamshedpur", expertise: "Manufacturing, ECE, Cloud", score: 88, projects: 16, availability: "High" },
  { name: "Ranchi University Innovation Cell", expertise: "Public Health, Education", score: 82, projects: 11, availability: "Medium" },
  { name: "XISS Social Innovation Lab", expertise: "Livelihood, Field Research", score: 79, projects: 9, availability: "High" }
];

export const industries = [
  { name: "Tata Steel Foundation", focus: "CSR pilots, manufacturing support", projects: 14, support: "Funding + Mentorship" },
  { name: "Jio Platforms Social Tech", focus: "Cloud, connectivity, AI products", projects: 9, support: "API / Cloud Credits" },
  { name: "CII Jharkhand Innovation Forum", focus: "Market access and industrial mentors", projects: 12, support: "Mentorship" },
  { name: "MedTech Ranchi Collective", focus: "Healthcare pilots and compliance", projects: 7, support: "Pilot Deployment" }
];

export const projects = challenges.slice(0, 10).map((c, i) => ({
  id: `PRJ-${2026}-${100 + i}`,
  title: c.title.replace("System", "Platform"),
  university: institutes[i % institutes.length].name,
  category: c.category,
  support: ["Funding", "Technical Mentorship", "Equipment", "API / Cloud Credits", "Pilot Deployment"][i % 5],
  technology: ["IoT sensors", "Computer vision", "Mobile app", "Data analytics", "Low-cost hardware"][i % 5],
  impact: 72 + i * 2,
  progress: c.progress
}));

export const chartData = {
  category: categories.map((name, i) => ({ name, value: [164, 142, 121, 138, 116, 104, 86, 91, 73][i] })),
  monthly: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((month, i) => ({ month, submissions: [126, 144, 171, 188, 226, 248][i], resolved: [24, 31, 39, 52, 67, 83][i] })),
  status: statuses.map((name, i) => ({ name, value: [118, 176, 238, 164, 141, 84, 93][i] })),
  district: districts.slice(0, 8).map((name, i) => ({ name, challenges: [148, 132, 111, 96, 88, 76, 69, 58][i] })),
  participation: ["Agriculture", "Health", "Water", "Infra", "Education"].map((name, i) => ({ name, institutes: [24, 18, 21, 14, 19][i], industries: [11, 16, 13, 10, 8][i] })),
  impact: categories.slice(0, 6).map((name, i) => ({ sector: name, impact: [86, 78, 71, 83, 62, 58][i] }))
};

export const teams = [
  { project: "Flood Alert Mesh", mentor: "Dr. Kavita Sinha", students: 8, departments: ["CSE", "ECE", "Civil"], progress: 64 },
  { project: "Crop Doctor AI", mentor: "Prof. Arvind Rao", students: 6, departments: ["AI & DS", "Biotechnology"], progress: 78 },
  { project: "Solar Cold Chain", mentor: "Dr. Farah Khan", students: 7, departments: ["Mechanical", "ECE"], progress: 46 }
];

export const supportTypes = ["Funding", "Technical Mentorship", "Equipment", "API / Cloud Credits", "Prototype Support", "Pilot Deployment", "Manufacturing", "Market Access"];
