import React, { useState, useMemo, useRef, useEffect } from 'react';
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Briefcase, TrendingUp, MapPin, Zap, Search, Info, Building2, Code2, Brain, Shield, Cloud, Layers, Cpu, Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight, Github, ExternalLink } from 'lucide-react';

// ==================== INDIA TECH JOB MARKET DATASET ====================
// Sources: NASSCOM Strategic Review 2025, Naukri JobSpeak (Jan-Dec 2025),
// Zinnov GCC Reports, AmbitionBox, Glassdoor, Levels.fyi, NITI Aayog, Deloitte
// Workforce: ~5.8M (FY25) | Industry: $282.6B | GCCs: 1,700+

const JOB_DATA = [
  // Software Engineering & Development
  { id: 1, role: "Java Developer", category: "Software Engineering", jobs: 450000, salary: 12, salaryRange: "6-25", exposure: 7.5, growth: -2, hiringTrend: "declining", topCity: "Bengaluru", reasoning: "Core backend skill but heavily impacted by AI code generation. Legacy J2EE roles shrinking; modern Spring Boot/microservices still in demand." },
  { id: 2, role: "Frontend Developer (React/Angular)", category: "Software Engineering", jobs: 320000, salary: 14, salaryRange: "7-28", exposure: 8.0, growth: 5, hiringTrend: "stable", topCity: "Bengaluru", reasoning: "UI generation is one of the most automatable tasks. Tools like v0, Lovable, Cursor producing production UIs. Premium for design+code hybrids." },
  { id: 3, role: "Backend Developer (Node/Python)", category: "Software Engineering", jobs: 280000, salary: 16, salaryRange: "8-32", exposure: 7.5, growth: 8, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "API/CRUD work increasingly automated. System design, distributed systems expertise still commands premium." },
  { id: 4, role: "Full-Stack Developer", category: "Software Engineering", jobs: 380000, salary: 18, salaryRange: "8-35", exposure: 7.5, growth: 18, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Naukri JobSpeak shows Full-Stack Data Scientist hiring +30% YoY (Apr 2025). Versatility valued; AI augments productivity." },
  { id: 5, role: "Mobile Developer (Android)", category: "Software Engineering", jobs: 180000, salary: 14, salaryRange: "7-26", exposure: 7.0, growth: 3, hiringTrend: "stable", topCity: "Hyderabad", reasoning: "Native Android development still requires platform-specific expertise. Compose, KMP knowledge premium." },
  { id: 6, role: "iOS Developer", category: "Software Engineering", jobs: 90000, salary: 18, salaryRange: "9-32", exposure: 7.0, growth: 5, hiringTrend: "stable", topCity: "Bengaluru", reasoning: "Smaller talent pool keeps wages elevated. SwiftUI, ARKit specialists in demand." },
  { id: 7, role: ".NET Developer", category: "Software Engineering", jobs: 220000, salary: 11, salaryRange: "5-22", exposure: 8.0, growth: -8, hiringTrend: "declining", topCity: "Hyderabad", reasoning: "Microsoft stack heavily used in enterprise/BFSI. Highly automatable via Copilot. Migration projects keep some demand." },
  { id: 8, role: "PHP Developer", category: "Software Engineering", jobs: 150000, salary: 7, salaryRange: "3-15", exposure: 8.5, growth: -15, hiringTrend: "declining", topCity: "Pune", reasoning: "Legacy stack. WordPress/Laravel maintenance work being absorbed by no-code + AI. Strong displacement risk." },
  { id: 9, role: "Embedded Software Engineer", category: "Software Engineering", jobs: 95000, salary: 14, salaryRange: "7-28", exposure: 4.0, growth: 12, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Hardware-software integration requires physical context. Auto, defense, IoT booming. Low AI substitution." },
  { id: 10, role: "Game Developer", category: "Software Engineering", jobs: 35000, salary: 12, salaryRange: "5-25", exposure: 7.0, growth: 15, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "AAA studios + mobile gaming + AVGC policy boost. Asset generation increasingly AI-assisted." },

  // Data & AI/ML
  { id: 11, role: "Data Analyst", category: "Data & AI/ML", jobs: 220000, salary: 8, salaryRange: "4-18", exposure: 8.5, growth: -5, hiringTrend: "declining", topCity: "Bengaluru", reasoning: "Most exposed analytical role. ChatGPT/Claude + Code Interpreter automate dashboards, SQL, narratives. Becoming entry-level commodity." },
  { id: 12, role: "Data Engineer", category: "Data & AI/ML", jobs: 130000, salary: 18, salaryRange: "9-35", exposure: 6.0, growth: 25, hiringTrend: "booming", topCity: "Hyderabad", reasoning: "Snowflake, Databricks, dbt, Spark expertise. Pipeline architecture remains complex. Big Data Testing Engineer +26% YoY." },
  { id: 13, role: "Data Scientist", category: "Data & AI/ML", jobs: 90000, salary: 15, salaryRange: "8-50", exposure: 5.5, growth: 22, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Median ₹15.1 LPA per Analytics India Mag 2025. Senior 25-35L, Principal 50L-1Cr+. ML interpretation still human-led." },
  { id: 14, role: "Machine Learning Engineer", category: "Data & AI/ML", jobs: 60000, salary: 22, salaryRange: "12-60", exposure: 4.5, growth: 35, hiringTrend: "booming", topCity: "Bengaluru", reasoning: "Naukri AI/ML hiring +54% YoY (Aug 2025). Model deployment, MLOps, fine-tuning skills 20-30% premium." },
  { id: 15, role: "AI / Generative AI Engineer", category: "Data & AI/ML", jobs: 35000, salary: 28, salaryRange: "15-90", exposure: 3.0, growth: 60, hiringTrend: "booming", topCity: "Bengaluru", reasoning: "Builds AI itself. Demand growing 600K to 1.25M by 2027 (Deloitte). LLMs, RAG, agentic systems hottest skills." },
  { id: 16, role: "BI Developer (Tableau/PowerBI)", category: "Data & AI/ML", jobs: 65000, salary: 9, salaryRange: "5-18", exposure: 8.5, growth: -10, hiringTrend: "declining", topCity: "Pune", reasoning: "Natural language to dashboards making this highly substitutable. Microsoft Fabric Copilot, Tableau Pulse pressure." },

  // Cloud, DevOps & Infrastructure
  { id: 17, role: "DevOps Engineer", category: "Cloud & DevOps", jobs: 180000, salary: 17, salaryRange: "9-30", exposure: 6.0, growth: 20, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "K8s, Terraform, GitOps. AI handles routine YAML; architecture & SRE practices stay premium." },
  { id: 18, role: "Cloud Engineer (AWS/Azure/GCP)", category: "Cloud & DevOps", jobs: 160000, salary: 19, salaryRange: "10-38", exposure: 6.0, growth: 28, hiringTrend: "booming", topCity: "Hyderabad", reasoning: "India public cloud market $17.8B by 2027 (23% CAGR). AWS Solution Architect cert most-demanded." },
  { id: 19, role: "Site Reliability Engineer", category: "Cloud & DevOps", jobs: 45000, salary: 24, salaryRange: "14-50", exposure: 5.5, growth: 22, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "FAANG/GCC concentrated. Incident response, observability complex; AI assists triage but humans own SLOs." },
  { id: 20, role: "Network Engineer", category: "Cloud & DevOps", jobs: 130000, salary: 9, salaryRange: "4-20", exposure: 6.0, growth: -3, hiringTrend: "declining", topCity: "Mumbai", reasoning: "SDN, automation reducing headcount. CCNA/CCNP path narrowing; cloud networking surviving." },
  { id: 21, role: "System Administrator", category: "Cloud & DevOps", jobs: 110000, salary: 7, salaryRange: "3-15", exposure: 7.0, growth: -12, hiringTrend: "declining", topCity: "Pune", reasoning: "Legacy on-prem ops shrinking rapidly with cloud migration + automation." },
  { id: 22, role: "Database Administrator", category: "Cloud & DevOps", jobs: 75000, salary: 12, salaryRange: "6-22", exposure: 7.0, growth: -5, hiringTrend: "declining", topCity: "Hyderabad", reasoning: "Managed services (RDS, Aurora, Cosmos) eating traditional DBA work. Performance tuning still valued." },

  // Cybersecurity
  { id: 23, role: "Cybersecurity Analyst", category: "Cybersecurity", jobs: 110000, salary: 12, salaryRange: "5-25", exposure: 5.0, growth: 30, hiringTrend: "booming", topCity: "Bengaluru", reasoning: "India faces >1M cybersecurity professional shortfall. Naukri listings doubled in 2025. AI-powered attacks raise stakes." },
  { id: 24, role: "Security Engineer", category: "Cybersecurity", jobs: 70000, salary: 18, salaryRange: "9-40", exposure: 5.0, growth: 32, hiringTrend: "booming", topCity: "Bengaluru", reasoning: "Cloud security, AppSec, zero-trust architecture. CISSP holders earn 30L-1.2Cr+." },
  { id: 25, role: "Penetration Tester", category: "Cybersecurity", jobs: 25000, salary: 16, salaryRange: "8-35", exposure: 4.0, growth: 25, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "OSCP-certified pen testers in short supply. Adversarial creativity hard to fully automate." },
  { id: 26, role: "SOC Analyst (L1/L2)", category: "Cybersecurity", jobs: 60000, salary: 7, salaryRange: "3-14", exposure: 6.5, growth: 8, hiringTrend: "stable", topCity: "Hyderabad", reasoning: "Tier-1 alert triage being automated by AI SOC platforms. L3 + threat hunting still human." },
  { id: 27, role: "Identity & Access Management", category: "Cybersecurity", jobs: 35000, salary: 14, salaryRange: "7-26", exposure: 6.0, growth: 18, hiringTrend: "growing", topCity: "Pune", reasoning: "Okta, SailPoint, CyberArk specialists. Compliance + zero-trust driving enterprise adoption." },

  // Product, Design & Management
  { id: 28, role: "Product Manager", category: "Product & Design", jobs: 80000, salary: 32, salaryRange: "15-80", exposure: 5.5, growth: 18, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "AI-Product PMs hottest niche. Senior PMs at unicorns/Tier-1 reach 50-80L. Strategy + stakeholder mgmt resilient." },
  { id: 29, role: "UI/UX Designer", category: "Product & Design", jobs: 95000, salary: 11, salaryRange: "5-25", exposure: 6.0, growth: 5, hiringTrend: "stable", topCity: "Bengaluru", reasoning: "Figma + AI plugins compress junior work. Senior designers with research/systems thinking thriving." },
  { id: 30, role: "Product Designer", category: "Product & Design", jobs: 35000, salary: 18, salaryRange: "8-40", exposure: 5.5, growth: 12, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Hybrid IC role at product cos. End-to-end ownership beyond pure visual design." },
  { id: 31, role: "Engineering Manager", category: "Product & Design", jobs: 65000, salary: 38, salaryRange: "20-90", exposure: 5.0, growth: 12, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "People + delivery leadership. AI assists planning, but org design, hiring, mentoring stay human." },
  { id: 32, role: "Tech Lead / Staff Engineer", category: "Product & Design", jobs: 130000, salary: 32, salaryRange: "16-75", exposure: 5.5, growth: 15, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Architecture + cross-team influence. AI-augmented seniors >> AI alone. FAANG SDE-3 reach 1-1.5Cr." },

  // QA & Testing
  { id: 33, role: "Manual QA Engineer", category: "QA & Testing", jobs: 200000, salary: 5, salaryRange: "2-10", exposure: 9.0, growth: -25, hiringTrend: "declining", topCity: "Pune", reasoning: "Most automatable role in IT services. Test generation by AI commoditizing this fast. TCS shed 23K+ partly here." },
  { id: 34, role: "Automation Test Engineer", category: "QA & Testing", jobs: 180000, salary: 9, salaryRange: "4-18", exposure: 7.0, growth: 5, hiringTrend: "stable", topCity: "Bengaluru", reasoning: "Selenium, Playwright, Cypress. Self-healing tests via AI rising; framework architects safer." },
  { id: 35, role: "SDET", category: "QA & Testing", jobs: 80000, salary: 16, salaryRange: "8-32", exposure: 6.5, growth: 10, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Engineer-grade testers at product cos. Performance, chaos, contract testing skills premium." },
  { id: 36, role: "Performance Test Engineer", category: "QA & Testing", jobs: 40000, salary: 12, salaryRange: "6-22", exposure: 6.5, growth: 3, hiringTrend: "stable", topCity: "Hyderabad", reasoning: "JMeter, k6, Gatling expertise. Scale testing for AI workloads creating new niche." },

  // IT Services & Enterprise
  { id: 37, role: "IT Support / Helpdesk", category: "IT Services", jobs: 280000, salary: 4, salaryRange: "2-8", exposure: 8.0, growth: -18, hiringTrend: "declining", topCity: "Pune", reasoning: "L1 support being absorbed by AI chatbots, copilots. Field support more resilient. Mass layoffs in BPO/ITES." },
  { id: 38, role: "Technical Writer", category: "IT Services", jobs: 35000, salary: 8, salaryRange: "4-18", exposure: 9.5, growth: -20, hiringTrend: "declining", topCity: "Bengaluru", reasoning: "Among the most exposed roles globally. AI generates first drafts, summaries, API docs effectively." },
  { id: 39, role: "Salesforce Developer", category: "IT Services", jobs: 85000, salary: 14, salaryRange: "7-28", exposure: 7.0, growth: 8, hiringTrend: "stable", topCity: "Hyderabad", reasoning: "Apex, LWC, Einstein integration. CRM platform demand steady; Agentforce reshaping skill mix." },
  { id: 40, role: "SAP Consultant", category: "IT Services", jobs: 110000, salary: 16, salaryRange: "8-35", exposure: 6.5, growth: 5, hiringTrend: "stable", topCity: "Mumbai", reasoning: "S/4HANA migration cycle. Functional + tech consultants in demand. Joule (SAP AI) emerging." },
  { id: 41, role: "ServiceNow Developer", category: "IT Services", jobs: 45000, salary: 15, salaryRange: "7-30", exposure: 7.0, growth: 12, hiringTrend: "growing", topCity: "Hyderabad", reasoning: "ITSM platform. Now Assist (AI) embedding into workflow. Certified developers earn premium." },
  { id: 42, role: "Oracle Developer", category: "IT Services", jobs: 70000, salary: 11, salaryRange: "5-22", exposure: 7.5, growth: -8, hiringTrend: "declining", topCity: "Bengaluru", reasoning: "Oracle laid off ~10K in India 2025. PL/SQL, EBS legacy. Fusion Cloud some growth." },
  { id: 43, role: "Mainframe Developer (COBOL)", category: "IT Services", jobs: 75000, salary: 13, salaryRange: "6-25", exposure: 8.0, growth: -12, hiringTrend: "declining", topCity: "Chennai", reasoning: "BFSI legacy. AI-driven modernization (IBM watsonx Code Assistant) accelerating COBOL to Java conversion." },

  // Specialized & Emerging Tech
  { id: 44, role: "Blockchain Developer", category: "Emerging Tech", jobs: 25000, salary: 18, salaryRange: "8-45", exposure: 5.0, growth: 15, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Solidity, Rust, Web3. Niche but resilient demand from CBDC, RWA tokenization." },
  { id: 45, role: "AR/VR Developer", category: "Emerging Tech", jobs: 15000, salary: 14, salaryRange: "6-30", exposure: 4.5, growth: 20, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Apple Vision Pro, Meta Quest ecosystem. Unity/Unreal experts scarce. AVGC policy support." },
  { id: 46, role: "IoT Engineer", category: "Emerging Tech", jobs: 40000, salary: 12, salaryRange: "6-24", exposure: 4.0, growth: 18, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "Smart manufacturing, EV, smart cities driving demand. Edge + cloud + embedded skills hybrid." },
  { id: 47, role: "Robotics Engineer", category: "Emerging Tech", jobs: 20000, salary: 16, salaryRange: "8-35", exposure: 3.0, growth: 25, hiringTrend: "growing", topCity: "Bengaluru", reasoning: "ROS, embedded ML, computer vision. Defense + warehouse + agritech robotics scaling." },
  { id: 48, role: "Quantum Computing Engineer", category: "Emerging Tech", jobs: 5000, salary: 25, salaryRange: "12-60", exposure: 2.0, growth: 40, hiringTrend: "booming", topCity: "Bengaluru", reasoning: "Nascent. National Quantum Mission ₹6,003 Cr funding. PhD-heavy talent pool." },
  { id: 49, role: "Hardware Engineer (VLSI/Chip)", category: "Emerging Tech", jobs: 45000, salary: 15, salaryRange: "7-35", exposure: 3.5, growth: 22, hiringTrend: "booming", topCity: "Bengaluru", reasoning: "India Semiconductor Mission ₹76K Cr. RTL design, verification, physical design specialists in extreme demand." },
];

const CITY_DATA = [
  { city: "Bengaluru", jobs: 1700000, gccs: 880, share: 24, avgSal: 18, growth: 12 },
  { city: "Hyderabad", jobs: 950000, gccs: 355, share: 14, avgSal: 16, growth: 22 },
  { city: "Pune", jobs: 720000, gccs: 360, share: 12, avgSal: 14, growth: 10 },
  { city: "Chennai", jobs: 680000, gccs: 300, share: 11, avgSal: 12, growth: 18 },
  { city: "Delhi NCR", jobs: 850000, gccs: 465, share: 13, avgSal: 17, growth: 15 },
  { city: "Mumbai", jobs: 580000, gccs: 220, share: 9, avgSal: 17, growth: 8 },
  { city: "Kolkata", jobs: 180000, gccs: 45, share: 3, avgSal: 10, growth: 14 },
  { city: "Tier-2 Cities", jobs: 240000, gccs: 220, share: 4, avgSal: 9, growth: 28 },
];

const COMPANIES = [
  { name: "TCS", type: "IT Services", hires: 40000, freshers: true, color: "#0070C0" },
  { name: "Accenture", type: "Consulting", hires: 25000, freshers: true, color: "#A100FF" },
  { name: "Capgemini", type: "Consulting", hires: 20000, freshers: true, color: "#0070AD" },
  { name: "Infosys", type: "IT Services", hires: 20000, freshers: true, color: "#007CC3" },
  { name: "Cognizant", type: "IT Services", hires: 18000, freshers: true, color: "#1A4F8E" },
  { name: "Wipro", type: "IT Services", hires: 15000, freshers: true, color: "#341551" },
  { name: "HCLTech", type: "IT Services", hires: 12000, freshers: true, color: "#0075C9" },
  { name: "Amazon India", type: "Product/GCC", hires: 8000, freshers: false, color: "#FF9900" },
  { name: "Google India", type: "Product/GCC", hires: 6000, freshers: false, color: "#4285F4" },
  { name: "Microsoft India", type: "Product/GCC", hires: 5500, freshers: false, color: "#00A4EF" },
  { name: "Flipkart", type: "Unicorn", hires: 5000, freshers: true, color: "#2874F0" },
  { name: "Walmart Global Tech", type: "GCC", hires: 4500, freshers: false, color: "#0071CE" },
  { name: "JPMorgan Chase", type: "GCC", hires: 4000, freshers: false, color: "#0066B2" },
  { name: "Goldman Sachs", type: "GCC", hires: 3500, freshers: false, color: "#7399C6" },
  { name: "Swiggy", type: "Unicorn", hires: 2500, freshers: true, color: "#FC8019" },
  { name: "Zomato", type: "Unicorn", hires: 2000, freshers: true, color: "#E23744" },
];

const SKILLS = [
  { skill: "Generative AI / LLMs", demand: 100, premium: 35 },
  { skill: "Cloud (AWS/Azure)", demand: 95, premium: 22 },
  { skill: "Machine Learning", demand: 92, premium: 28 },
  { skill: "Python", demand: 88, premium: 18 },
  { skill: "Cybersecurity", demand: 85, premium: 30 },
  { skill: "Data Engineering", demand: 82, premium: 25 },
  { skill: "DevOps / K8s", demand: 78, premium: 20 },
  { skill: "Full-Stack (MERN)", demand: 75, premium: 15 },
  { skill: "React / Next.js", demand: 72, premium: 12 },
  { skill: "SQL / Databases", demand: 70, premium: 8 },
];

const AIML_TREND = [
  { month: "Jan", value: 18 }, { month: "Feb", value: 21 }, { month: "Mar", value: 25 },
  { month: "Apr", value: 28 }, { month: "May", value: 25 }, { month: "Jun", value: 32 },
  { month: "Jul", value: 41 }, { month: "Aug", value: 54 }, { month: "Sep", value: 48 },
  { month: "Oct", value: 45 }, { month: "Nov", value: 50 }, { month: "Dec", value: 52 },
];

// ==================== COLOR SCALES ====================
const lerp = (a, b, t) => a + (b - a) * t;
const lerpColor = (c1, c2, t) => {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r},${g},${b})`;
};

const exposureColor = (score) => {
  const t = Math.max(0, Math.min(1, score / 10));
  if (t < 0.5) return lerpColor([16, 185, 129], [234, 179, 8], t * 2);
  return lerpColor([234, 179, 8], [239, 68, 68], (t - 0.5) * 2);
};

const salaryColor = (sal) => {
  const t = Math.max(0, Math.min(1, sal / 35));
  return lerpColor([30, 58, 138], [34, 211, 238], t);
};

const growthColor = (g) => {
  const t = Math.max(-1, Math.min(1, g / 30));
  if (t < 0) return lerpColor([239, 68, 68], [100, 116, 139], t + 1);
  return lerpColor([100, 116, 139], [34, 197, 94], t);
};

const CATEGORY_META = {
  "Software Engineering": { icon: Code2, color: "#3b82f6" },
  "Data & AI/ML": { icon: Brain, color: "#a855f7" },
  "Cloud & DevOps": { icon: Cloud, color: "#06b6d4" },
  "Cybersecurity": { icon: Shield, color: "#f59e0b" },
  "Product & Design": { icon: Layers, color: "#ec4899" },
  "QA & Testing": { icon: Sparkles, color: "#84cc16" },
  "IT Services": { icon: Briefcase, color: "#64748b" },
  "Emerging Tech": { icon: Cpu, color: "#10b981" },
};

const fmtJobs = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
};
const fmtSal = (n) => `₹${n}L`;

// ==================== TREEMAP ====================
function Treemap({ data, mode, search, selected, onHover, width, height }) {
  const filtered = useMemo(() => {
    let d = data;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(x => x.role.toLowerCase().includes(q) || x.category.toLowerCase().includes(q));
    }
    if (selected !== "All") d = d.filter(x => x.category === selected);
    return d;
  }, [data, search, selected]);

  const root = useMemo(() => {
    const grouped = {};
    filtered.forEach(j => {
      if (!grouped[j.category]) grouped[j.category] = [];
      grouped[j.category].push(j);
    });
    const tree = {
      name: "root",
      children: Object.entries(grouped).map(([cat, jobs]) => ({
        name: cat,
        children: jobs.map(j => ({ ...j, value: j.jobs })),
      })),
    };
    const h = hierarchy(tree).sum(d => d.value).sort((a, b) => b.value - a.value);
    treemap().tile(treemapSquarify).size([width, height]).paddingTop(22).paddingInner(2).paddingOuter(3).round(true)(h);
    return h;
  }, [filtered, width, height]);

  const getColor = (d) => {
    if (mode === "exposure") return exposureColor(d.exposure);
    if (mode === "salary") return salaryColor(d.salary);
    if (mode === "growth") return growthColor(d.growth);
    return CATEGORY_META[d.category]?.color || "#64748b";
  };

  return (
    <svg width={width} height={height} className="font-sans">
      {root.children?.map((cat, i) => {
        const w = cat.x1 - cat.x0;
        const h = cat.y1 - cat.y0;
        if (w < 80 || h < 30) return null;
        return (
          <g key={`cat-${i}`}>
            <rect x={cat.x0} y={cat.y0} width={w} height={20} fill="rgba(15, 23, 42, 0.95)" stroke="rgba(148,163,184,0.2)" />
            <text x={cat.x0 + 8} y={cat.y0 + 14} fill="#e2e8f0" fontSize="11" fontWeight="600" letterSpacing="0.5">
              {cat.data.name.toUpperCase()}
            </text>
          </g>
        );
      })}
      {root.leaves().map((leaf, i) => {
        const w = leaf.x1 - leaf.x0;
        const h = leaf.y1 - leaf.y0;
        const color = getColor(leaf.data);
        const showLabel = w > 60 && h > 28;
        const showSubLabel = w > 90 && h > 50;
        return (
          <g key={`leaf-${i}`}
            onMouseEnter={(e) => onHover(leaf.data, e)}
            onMouseLeave={() => onHover(null, null)}
            onMouseMove={(e) => onHover(leaf.data, e)}
            style={{ cursor: "pointer" }}>
            <rect x={leaf.x0} y={leaf.y0} width={w} height={h} fill={color}
              stroke="rgba(15, 23, 42, 0.6)" strokeWidth={1}
              className="transition-opacity hover:opacity-80" />
            {showLabel && (
              <foreignObject x={leaf.x0 + 4} y={leaf.y0 + 3} width={w - 8} height={h - 6} style={{ pointerEvents: "none" }}>
                <div style={{ color: "#0f172a", fontSize: Math.min(13, Math.max(10, w / 12)) + "px", fontWeight: 700, lineHeight: 1.1, overflow: "hidden", textShadow: "0 1px 0 rgba(255,255,255,0.3)" }}>
                  {leaf.data.role}
                </div>
                {showSubLabel && (
                  <div style={{ color: "rgba(15,23,42,0.75)", fontSize: "10px", marginTop: 4, fontWeight: 600 }}>
                    {fmtJobs(leaf.data.jobs)} · {fmtSal(leaf.data.salary)}
                  </div>
                )}
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ==================== TOOLTIP ====================
function JobTooltip({ job, pos }) {
  if (!job || !pos) return null;
  const Icon = CATEGORY_META[job.category]?.icon || Briefcase;
  const trendColor = {
    booming: "text-emerald-400", growing: "text-green-400",
    stable: "text-blue-400", declining: "text-red-400",
  }[job.hiringTrend];

  return (
    <div className="fixed z-50 pointer-events-none w-80 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-4"
      style={{
        left: Math.min(pos.x + 15, window.innerWidth - 340),
        top: Math.min(pos.y + 15, window.innerHeight - 380),
      }}>
      <div className="flex items-start gap-2 mb-3 pb-3 border-b border-slate-700">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: CATEGORY_META[job.category]?.color + "30" }}>
          <Icon size={16} style={{ color: CATEGORY_META[job.category]?.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm leading-tight">{job.role}</div>
          <div className="text-xs text-slate-400 mt-0.5">{job.category}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-slate-800/60 rounded-lg p-2">
          <div className="text-slate-500 text-[10px] uppercase tracking-wider">Workforce</div>
          <div className="text-white font-bold">{fmtJobs(job.jobs)}</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2">
          <div className="text-slate-500 text-[10px] uppercase tracking-wider">Median Salary</div>
          <div className="text-white font-bold">{fmtSal(job.salary)}</div>
          <div className="text-[10px] text-slate-400">₹{job.salaryRange} LPA range</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2">
          <div className="text-slate-500 text-[10px] uppercase tracking-wider">AI Exposure</div>
          <div className="flex items-center gap-1">
            <span className="text-white font-bold">{job.exposure}/10</span>
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-1">
              <div className="h-full" style={{ width: `${job.exposure * 10}%`, backgroundColor: exposureColor(job.exposure) }} />
            </div>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2">
          <div className="text-slate-500 text-[10px] uppercase tracking-wider">YoY Growth</div>
          <div className="flex items-center gap-1">
            {job.growth >= 0 ? <ArrowUpRight size={12} className="text-emerald-400" /> : <ArrowDownRight size={12} className="text-red-400" />}
            <span className={`font-bold ${job.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {job.growth > 0 ? "+" : ""}{job.growth}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs mb-3 px-1">
        <div className="flex items-center gap-1 text-slate-400">
          <MapPin size={10} /><span>{job.topCity}</span>
        </div>
        <div className={`flex items-center gap-1 font-semibold capitalize ${trendColor}`}>
          <Zap size={10} /><span>{job.hiringTrend}</span>
        </div>
      </div>

      <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/50 rounded-lg p-2.5 border border-slate-800">
        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
          <Info size={9} /> AI Impact Analysis
        </div>
        {job.reasoning}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [mode, setMode] = useState("exposure");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");
  const [hover, setHover] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);
  const [tab, setTab] = useState("treemap");
  const [tmSize, setTmSize] = useState({ w: 1200, h: 600 });
  const tmRef = useRef(null);

  useEffect(() => {
    const update = () => {
      if (tmRef.current) {
        const rect = tmRef.current.getBoundingClientRect();
        setTmSize({ w: Math.max(400, rect.width), h: Math.max(400, Math.min(700, rect.width * 0.55)) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const stats = useMemo(() => {
    const total = JOB_DATA.reduce((s, j) => s + j.jobs, 0);
    const avgExp = JOB_DATA.reduce((s, j) => s + j.exposure * j.jobs, 0) / total;
    const highRisk = JOB_DATA.filter(j => j.exposure >= 7).reduce((s, j) => s + j.jobs, 0);
    const booming = JOB_DATA.filter(j => j.growth >= 20).reduce((s, j) => s + j.jobs, 0);
    return { total, avgExp, highRisk, booming };
  }, []);

  const cats = ["All", ...Object.keys(CATEGORY_META)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="relative overflow-hidden border-b border-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-green-500/10"></div>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(249,115,22,0.08), transparent 50%), radial-gradient(circle at 70% 50%, rgba(34,197,94,0.08), transparent 50%)" }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-green-500/20 border border-orange-500/30 text-xs font-medium text-orange-200">
              🇮🇳 India Tech Workforce 2025
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-xs text-slate-300 flex items-center gap-1">
              <Github size={11} /> Inspired by karpathy/jobs
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            India Tech Job Market Visualizer
          </h1>
          <p className="text-slate-400 mt-2 max-w-3xl text-sm sm:text-base">
            AI exposure, salaries, and hiring trends across {JOB_DATA.length}+ tech roles in India's $282.6B IT industry. Box size = workforce headcount. Color = selected metric.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <StatCard icon={Briefcase} label="Total Tech Workforce" value="5.8M" sub="FY25 (NASSCOM)" color="blue" />
            <StatCard icon={Building2} label="Active GCCs" value="1,700+" sub="2.4M employed" color="purple" />
            <StatCard icon={AlertTriangle} label="Avg AI Exposure" value={stats.avgExp.toFixed(1) + "/10"} sub={`${fmtJobs(stats.highRisk)} high-risk`} color="orange" />
            <StatCard icon={TrendingUp} label="Booming Roles" value={fmtJobs(stats.booming)} sub="20%+ YoY growth" color="green" />
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {[
            { id: "treemap", label: "Treemap", icon: Layers },
            { id: "cities", label: "Cities", icon: MapPin },
            { id: "skills", label: "Skills & Trends", icon: Sparkles },
            { id: "companies", label: "Top Hirers", icon: Building2 },
          ].map(t => {
            const Ic = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  tab === t.id ? "border-orange-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}>
                <Ic size={15} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === "treemap" && (
          <>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-4 mb-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Color By</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "exposure", label: "AI Exposure", color: "from-emerald-500 via-yellow-500 to-red-500" },
                      { id: "salary", label: "Salary", color: "from-blue-800 to-cyan-400" },
                      { id: "growth", label: "Growth", color: "from-red-500 via-slate-500 to-green-500" },
                      { id: "category", label: "Category", color: "from-purple-500 to-pink-500" },
                    ].map(m => (
                      <button key={m.id} onClick={() => setMode(m.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          mode === m.id ? "bg-white text-slate-900 shadow-lg" : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700"
                        }`}>
                        <div className={`inline-block w-2 h-2 rounded-full mr-1.5 align-middle bg-gradient-to-r ${m.color}`}></div>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:w-64">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Search</div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search role..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Filter by Category</div>
                <div className="flex flex-wrap gap-1.5">
                  {cats.map(c => {
                    const meta = CATEGORY_META[c];
                    const Ic = meta?.icon;
                    return (
                      <button key={c} onClick={() => setSelected(c)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          selected === c ? "bg-white text-slate-900 border-white" : "bg-slate-800/40 text-slate-300 border-slate-700 hover:border-slate-600"
                        }`}
                        style={selected === c ? {} : { borderLeftColor: meta?.color, borderLeftWidth: 3 }}>
                        {Ic && <Ic size={11} />}{c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <ColorLegend mode={mode} />
              </div>
            </div>

            <div ref={tmRef} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-3 overflow-hidden">
              <Treemap data={JOB_DATA} mode={mode} search={search} selected={selected}
                onHover={(d, e) => { setHover(d); if (e) setHoverPos({ x: e.clientX, y: e.clientY }); }}
                width={tmSize.w - 24} height={tmSize.h} />
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              💡 Hover any role for detailed AI impact analysis. Box area = workforce size · Color = {mode}.
            </p>
          </>
        )}

        {tab === "cities" && <CitiesPanel />}
        {tab === "skills" && <SkillsPanel />}
        {tab === "companies" && <CompaniesPanel />}
      </main>

      <footer className="border-t border-slate-800 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              Sources: NASSCOM Strategic Review 2025 · Naukri JobSpeak (Jan–Dec 2025) · Zinnov GCC Reports · NITI Aayog · Deloitte AI Talent Forecast · Levels.fyi · AmbitionBox
            </div>
            <a href="https://github.com/karpathy/jobs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-orange-400 transition-colors">
              <Github size={12} /> Methodology inspired by karpathy/jobs <ExternalLink size={10} />
            </a>
          </div>
          <div className="mt-2 text-slate-600">
            ⚠️ Workforce numbers are estimates synthesized from public reports. AI exposure scores follow Karpathy's 0–10 rubric: digital-native + remote-doable work scores higher; physical/in-person/specialized work scores lower.
          </div>
        </div>
      </footer>

      <JobTooltip job={hover} pos={hoverPos} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
    orange: "from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-400",
    green: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-3 sm:p-4 backdrop-blur`}>
      <div className="flex items-center justify-between mb-1.5">
        <Icon size={16} />
        <div className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{label}</div>
      </div>
      <div className="text-xl sm:text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] sm:text-xs opacity-70 mt-0.5">{sub}</div>
    </div>
  );
}

function ColorLegend({ mode }) {
  if (mode === "category") {
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_META).map(([cat, m]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: m.color }}></div>{cat}
          </div>
        ))}
      </div>
    );
  }
  const cfg = {
    exposure: { left: "Safe (0)", right: "Highly Exposed (10)", grad: "linear-gradient(to right, rgb(16,185,129), rgb(234,179,8), rgb(239,68,68))" },
    salary: { left: "Low (₹3L)", right: "High (₹35L+)", grad: "linear-gradient(to right, rgb(30,58,138), rgb(34,211,238))" },
    growth: { left: "Declining (-25%)", right: "Booming (+30%)", grad: "linear-gradient(to right, rgb(239,68,68), rgb(100,116,139), rgb(34,197,94))" },
  }[mode];
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{cfg.left}</span>
      <div className="flex-1 h-3 rounded-full" style={{ background: cfg.grad }}></div>
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{cfg.right}</span>
    </div>
  );
}

function CitiesPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold mb-1">India's Tech Hub Distribution</h2>
        <p className="text-xs text-slate-400 mb-5">94% of GCCs concentrated in Tier-1 cities · Bengaluru leads with 24% of all IT jobs</p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={CITY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
            <XAxis dataKey="city" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => fmtJobs(v)} />
            <RTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#fff" }}
              formatter={(v, name) => name === "jobs" ? [fmtJobs(v) + " tech workers", "Workforce"] : [v, name]} />
            <Bar dataKey="jobs" radius={[6, 6, 0, 0]}>
              {CITY_DATA.map((c, i) => <Cell key={i} fill={`hsl(${20 + i * 35}, 70%, 55%)`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CITY_DATA.map((c) => (
          <div key={c.city} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-orange-500/40 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <MapPin size={16} className="text-orange-400" />
              <span className={`text-xs font-bold ${c.growth >= 15 ? "text-emerald-400" : "text-blue-400"}`}>+{c.growth}% YoY</span>
            </div>
            <div className="text-white font-bold text-sm leading-tight mb-2">{c.city}</div>
            <div className="space-y-1.5 text-xs">
              <Row label="Workforce" value={fmtJobs(c.jobs)} />
              <Row label="GCCs" value={c.gccs.toLocaleString()} />
              <Row label="Avg Salary" value={fmtSal(c.avgSal)} />
              <Row label="Share" value={c.share + "%"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-semibold">{value}</span>
    </div>
  );
}

function SkillsPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold mb-1">AI/ML Hiring Boom — Naukri JobSpeak 2025</h2>
        <p className="text-xs text-slate-400 mb-5">Year-over-year growth in AI/ML job postings · Peaked at +54% in August 2025</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={AIML_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `+${v}%`} />
            <RTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
              formatter={(v) => [`+${v}% YoY`, "AI/ML Hiring"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {AIML_TREND.map((d, i) => <Cell key={i} fill={`rgb(${Math.min(255, 100 + d.value * 3)}, ${Math.max(50, 200 - d.value * 2)}, 50)`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold mb-1">Top In-Demand Skills (2025)</h2>
        <p className="text-xs text-slate-400 mb-5">Demand index (relative) · Salary premium % over base role</p>
        <div className="space-y-3">
          {SKILLS.map((s) => (
            <div key={s.skill}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-white font-semibold">{s.skill}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400 font-bold">+{s.premium}% premium</span>
                  <span className="text-slate-400">{s.demand}/100</span>
                </div>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 transition-all duration-500" style={{ width: `${s.demand}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/50 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-emerald-400" size={20} />
            <h3 className="text-base font-bold">Booming Roles (20%+ growth)</h3>
          </div>
          <div className="space-y-2">
            {JOB_DATA.filter(j => j.growth >= 20).sort((a, b) => b.growth - a.growth).slice(0, 6).map(j => (
              <div key={j.id} className="flex items-center justify-between text-sm bg-slate-900/50 rounded-lg px-3 py-2">
                <span className="text-white">{j.role}</span>
                <span className="text-emerald-400 font-bold text-xs">+{j.growth}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-slate-900/50 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-400" size={20} />
            <h3 className="text-base font-bold">Declining Roles (AI Pressure)</h3>
          </div>
          <div className="space-y-2">
            {JOB_DATA.filter(j => j.growth < 0).sort((a, b) => a.growth - b.growth).slice(0, 6).map(j => (
              <div key={j.id} className="flex items-center justify-between text-sm bg-slate-900/50 rounded-lg px-3 py-2">
                <span className="text-white">{j.role}</span>
                <span className="text-red-400 font-bold text-xs">{j.growth}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompaniesPanel() {
  const grouped = COMPANIES.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold mb-1">Top Hiring Companies (2025)</h2>
        <p className="text-xs text-slate-400 mb-5">Estimated annual hires · Indian IT majors dominate fresher hiring; GCCs lead lateral premium hiring</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={[...COMPANIES].sort((a, b) => b.hires - a.hires)} layout="vertical" margin={{ top: 0, right: 30, left: 110, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => fmtJobs(v)} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#e2e8f0", fontSize: 11 }} width={100} />
            <RTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
              formatter={(v) => [fmtJobs(v) + " hires/yr", "Annual Hiring"]} />
            <Bar dataKey="hires" radius={[0, 6, 6, 0]}>
              {[...COMPANIES].sort((a, b) => b.hires - a.hires).map((c, i) => <Cell key={i} fill={c.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(grouped).map(([type, comps]) => (
          <div key={type} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">{type}</div>
            <div className="space-y-2">
              {comps.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}></div>
                  <div className="min-w-0">
                    <div className="text-sm text-white font-semibold leading-tight truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {fmtJobs(c.hires)}/yr {c.freshers && "· Freshers ✓"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-orange-900/20 via-slate-900/50 to-green-900/20 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          <Sparkles className="text-orange-400" size={18} /> 2025 Hiring Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-900/60 rounded-xl p-3">
            <div className="text-emerald-400 font-bold text-2xl">+126K</div>
            <div className="text-xs text-slate-400">Net new tech hires FY25</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3">
            <div className="text-orange-400 font-bold text-2xl">82,000</div>
            <div className="text-xs text-slate-400">Top-5 IT firms fresher target FY26</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3">
            <div className="text-purple-400 font-bold text-2xl">100K+</div>
            <div className="text-xs text-slate-400">Net jobs added by GCCs in FY25</div>
          </div>
        </div>
      </div>
    </div>
  );
}
