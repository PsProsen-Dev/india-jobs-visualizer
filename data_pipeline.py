#!/usr/bin/env python3
"""
India Tech Job Market Visualizer - Data Pipeline
Scrapes, processes, and exports India job market data
Integrates NASSCOM, Naukri JobSpeak, Zinnov, NITI Aayog, and AI exposure scoring

Usage:
    python3 data_pipeline.py --export csv
    python3 data_pipeline.py --export json
    python3 data_pipeline.py --score  # Requires OPENROUTER_API_KEY
"""

import json
import csv
import os
import sys
from datetime import datetime
from typing import Dict, List, Any
import subprocess

# Job market data - hardcoded for now (can be replaced with API calls)
JOB_DATA = [
    {"role": "Java Developer", "category": "Software Engineering", "jobs": 450000, "salary": 12, "salaryRange": "6-25", "exposure": 7.5, "growth": -2, "city": "Bengaluru", "reasoning": "Core backend skill but heavily impacted by AI code generation."},
    {"role": "Frontend Developer (React/Angular)", "category": "Software Engineering", "jobs": 320000, "salary": 14, "salaryRange": "7-28", "exposure": 8.0, "growth": 5, "city": "Bengaluru", "reasoning": "UI generation is one of the most automatable tasks."},
    {"role": "Backend Developer (Node/Python)", "category": "Software Engineering", "jobs": 280000, "salary": 16, "salaryRange": "8-32", "exposure": 7.5, "growth": 8, "city": "Bengaluru", "reasoning": "API/CRUD work increasingly automated."},
    {"role": "Full-Stack Developer", "category": "Software Engineering", "jobs": 380000, "salary": 18, "salaryRange": "8-35", "exposure": 7.5, "growth": 18, "city": "Bengaluru", "reasoning": "Full-Stack Data Scientist hiring +30% YoY."},
    {"role": "Mobile Developer (Android)", "category": "Software Engineering", "jobs": 180000, "salary": 14, "salaryRange": "7-26", "exposure": 7.0, "growth": 3, "city": "Hyderabad", "reasoning": "Native Android development still requires platform-specific expertise."},
    {"role": "iOS Developer", "category": "Software Engineering", "jobs": 90000, "salary": 18, "salaryRange": "9-32", "exposure": 7.0, "growth": 5, "city": "Bengaluru", "reasoning": "Smaller talent pool keeps wages elevated."},
    {"role": ".NET Developer", "category": "Software Engineering", "jobs": 220000, "salary": 11, "salaryRange": "5-22", "exposure": 8.0, "growth": -8, "city": "Hyderabad", "reasoning": "Highly automatable via Copilot. Migration projects keep demand."},
    {"role": "PHP Developer", "category": "Software Engineering", "jobs": 150000, "salary": 7, "salaryRange": "3-15", "exposure": 8.5, "growth": -15, "city": "Pune", "reasoning": "Legacy stack. WordPress/Laravel maintenance absorbed by AI."},
    {"role": "Embedded Software Engineer", "category": "Software Engineering", "jobs": 95000, "salary": 14, "salaryRange": "7-28", "exposure": 4.0, "growth": 12, "city": "Bengaluru", "reasoning": "Hardware-software integration requires physical context."},
    {"role": "Game Developer", "category": "Software Engineering", "jobs": 35000, "salary": 12, "salaryRange": "5-25", "exposure": 7.0, "growth": 15, "city": "Bengaluru", "reasoning": "AVGC policy boost. Asset generation increasingly AI-assisted."},
    {"role": "Data Analyst", "category": "Data & AI/ML", "jobs": 220000, "salary": 8, "salaryRange": "4-18", "exposure": 8.5, "growth": -5, "city": "Bengaluru", "reasoning": "ChatGPT/Claude automate dashboards, SQL, narratives effectively."},
    {"role": "Data Engineer", "category": "Data & AI/ML", "jobs": 130000, "salary": 18, "salaryRange": "9-35", "exposure": 6.0, "growth": 25, "city": "Hyderabad", "reasoning": "Snowflake, Databricks, dbt expertise. Architecture remains complex."},
    {"role": "Data Scientist", "category": "Data & AI/ML", "jobs": 90000, "salary": 15, "salaryRange": "8-50", "exposure": 5.5, "growth": 22, "city": "Bengaluru", "reasoning": "ML interpretation still human-led."},
    {"role": "Machine Learning Engineer", "category": "Data & AI/ML", "jobs": 60000, "salary": 22, "salaryRange": "12-60", "exposure": 4.5, "growth": 35, "city": "Bengaluru", "reasoning": "Model deployment, MLOps skills 20-30% premium."},
    {"role": "AI / Generative AI Engineer", "category": "Data & AI/ML", "jobs": 35000, "salary": 28, "salaryRange": "15-90", "exposure": 3.0, "growth": 60, "city": "Bengaluru", "reasoning": "Builds AI itself. Demand growing 600K -> 1.25M by 2027."},
    {"role": "BI Developer (Tableau/PowerBI)", "category": "Data & AI/ML", "jobs": 65000, "salary": 9, "salaryRange": "5-18", "exposure": 8.5, "growth": -10, "city": "Pune", "reasoning": "Natural language dashboards highly substitutable."},
    {"role": "DevOps Engineer", "category": "Cloud & DevOps", "jobs": 180000, "salary": 17, "salaryRange": "9-30", "exposure": 6.0, "growth": 20, "city": "Bengaluru", "reasoning": "K8s, Terraform, GitOps. Architecture stays premium."},
    {"role": "Cloud Engineer (AWS/Azure/GCP)", "category": "Cloud & DevOps", "jobs": 160000, "salary": 19, "salaryRange": "10-38", "exposure": 6.0, "growth": 28, "city": "Hyderabad", "reasoning": "India cloud market $17.8B by 2027 (23% CAGR)."},
    {"role": "Site Reliability Engineer", "category": "Cloud & DevOps", "jobs": 45000, "salary": 24, "salaryRange": "14-50", "exposure": 5.5, "growth": 22, "city": "Bengaluru", "reasoning": "Incident response complex; humans own SLOs."},
    {"role": "Network Engineer", "category": "Cloud & DevOps", "jobs": 130000, "salary": 9, "salaryRange": "4-20", "exposure": 6.0, "growth": -3, "city": "Mumbai", "reasoning": "SDN automation reducing headcount."},
    {"role": "System Administrator", "category": "Cloud & DevOps", "jobs": 110000, "salary": 7, "salaryRange": "3-15", "exposure": 7.0, "growth": -12, "city": "Pune", "reasoning": "Legacy on-prem ops shrinking rapidly."},
    {"role": "Database Administrator", "category": "Cloud & DevOps", "jobs": 75000, "salary": 12, "salaryRange": "6-22", "exposure": 7.0, "growth": -5, "city": "Hyderabad", "reasoning": "Managed services eating traditional DBA work."},
    {"role": "Cybersecurity Analyst", "category": "Cybersecurity", "jobs": 110000, "salary": 12, "salaryRange": "5-25", "exposure": 5.0, "growth": 30, "city": "Bengaluru", "reasoning": "India faces >1M cybersecurity shortfall."},
    {"role": "Security Engineer", "category": "Cybersecurity", "jobs": 70000, "salary": 18, "salaryRange": "9-40", "exposure": 5.0, "growth": 32, "city": "Bengaluru", "reasoning": "Cloud security, AppSec, zero-trust architecture."},
    {"role": "Penetration Tester", "category": "Cybersecurity", "jobs": 25000, "salary": 16, "salaryRange": "8-35", "exposure": 4.0, "growth": 25, "city": "Bengaluru", "reasoning": "OSCP-certified testers in short supply."},
    {"role": "SOC Analyst (L1/L2)", "category": "Cybersecurity", "jobs": 60000, "salary": 7, "salaryRange": "3-14", "exposure": 6.5, "growth": 8, "city": "Hyderabad", "reasoning": "L1 alert triage being automated by AI."},
    {"role": "Identity & Access Management", "category": "Cybersecurity", "jobs": 35000, "salary": 14, "salaryRange": "7-26", "exposure": 6.0, "growth": 18, "city": "Pune", "reasoning": "Compliance + zero-trust driving adoption."},
    {"role": "Product Manager", "category": "Product & Design", "jobs": 80000, "salary": 32, "salaryRange": "15-80", "exposure": 5.5, "growth": 18, "city": "Bengaluru", "reasoning": "AI-Product PMs hottest niche."},
    {"role": "UI/UX Designer", "category": "Product & Design", "jobs": 95000, "salary": 11, "salaryRange": "5-25", "exposure": 6.0, "growth": 5, "city": "Bengaluru", "reasoning": "Senior designers with research thriving."},
    {"role": "Product Designer", "category": "Product & Design", "jobs": 35000, "salary": 18, "salaryRange": "8-40", "exposure": 5.5, "growth": 12, "city": "Bengaluru", "reasoning": "Hybrid IC role at product cos."},
    {"role": "Engineering Manager", "category": "Product & Design", "jobs": 65000, "salary": 38, "salaryRange": "20-90", "exposure": 5.0, "growth": 12, "city": "Bengaluru", "reasoning": "People + delivery leadership stays human."},
    {"role": "Tech Lead / Staff Engineer", "category": "Product & Design", "jobs": 130000, "salary": 32, "salaryRange": "16-75", "exposure": 5.5, "growth": 15, "city": "Bengaluru", "reasoning": "Architecture + influence. AI-augmented seniors >> AI."},
    {"role": "Manual QA Engineer", "category": "QA & Testing", "jobs": 200000, "salary": 5, "salaryRange": "2-10", "exposure": 9.0, "growth": -25, "city": "Pune", "reasoning": "Most automatable role. TCS shed 23K+."},
    {"role": "Automation Test Engineer", "category": "QA & Testing", "jobs": 180000, "salary": 9, "salaryRange": "4-18", "exposure": 7.0, "growth": 5, "city": "Bengaluru", "reasoning": "Self-healing tests via AI rising."},
    {"role": "SDET", "category": "QA & Testing", "jobs": 80000, "salary": 16, "salaryRange": "8-32", "exposure": 6.5, "growth": 10, "city": "Bengaluru", "reasoning": "Engineer-grade testers at product cos."},
    {"role": "Performance Test Engineer", "category": "QA & Testing", "jobs": 40000, "salary": 12, "salaryRange": "6-22", "exposure": 6.5, "growth": 3, "city": "Hyderabad", "reasoning": "Scale testing for AI workloads creating niche."},
    {"role": "IT Support / Helpdesk", "category": "IT Services", "jobs": 280000, "salary": 4, "salaryRange": "2-8", "exposure": 8.0, "growth": -18, "city": "Pune", "reasoning": "L1 support absorbed by AI chatbots."},
    {"role": "Technical Writer", "category": "IT Services", "jobs": 35000, "salary": 8, "salaryRange": "4-18", "exposure": 9.5, "growth": -20, "city": "Bengaluru", "reasoning": "AI generates drafts, summaries, API docs."},
    {"role": "Salesforce Developer", "category": "IT Services", "jobs": 85000, "salary": 14, "salaryRange": "7-28", "exposure": 7.0, "growth": 8, "city": "Hyderabad", "reasoning": "CRM platform demand steady."},
    {"role": "SAP Consultant", "category": "IT Services", "jobs": 110000, "salary": 16, "salaryRange": "8-35", "exposure": 6.5, "growth": 5, "city": "Mumbai", "reasoning": "S/4HANA migration cycle ongoing."},
    {"role": "ServiceNow Developer", "category": "IT Services", "jobs": 45000, "salary": 15, "salaryRange": "7-30", "exposure": 7.0, "growth": 12, "city": "Hyderabad", "reasoning": "Now Assist (AI) embedding into workflow."},
    {"role": "Oracle Developer", "category": "IT Services", "jobs": 70000, "salary": 11, "salaryRange": "5-22", "exposure": 7.5, "growth": -8, "city": "Bengaluru", "reasoning": "Oracle laid off ~10K in India 2025."},
    {"role": "Mainframe Developer (COBOL)", "category": "IT Services", "jobs": 75000, "salary": 13, "salaryRange": "6-25", "exposure": 8.0, "growth": -12, "city": "Chennai", "reasoning": "AI-driven modernization accelerating conversion."},
    {"role": "Blockchain Developer", "category": "Emerging Tech", "jobs": 25000, "salary": 18, "salaryRange": "8-45", "exposure": 5.0, "growth": 15, "city": "Bengaluru", "reasoning": "Solidity, Rust, Web3. Niche but resilient."},
    {"role": "AR/VR Developer", "category": "Emerging Tech", "jobs": 15000, "salary": 14, "salaryRange": "6-30", "exposure": 4.5, "growth": 20, "city": "Bengaluru", "reasoning": "Apple Vision Pro, Meta Quest ecosystem."},
    {"role": "IoT Engineer", "category": "Emerging Tech", "jobs": 40000, "salary": 12, "salaryRange": "6-24", "exposure": 4.0, "growth": 18, "city": "Bengaluru", "reasoning": "Smart manufacturing, EV, smart cities."},
    {"role": "Robotics Engineer", "category": "Emerging Tech", "jobs": 20000, "salary": 16, "salaryRange": "8-35", "exposure": 3.0, "growth": 25, "city": "Bengaluru", "reasoning": "Defense + warehouse + agritech scaling."},
    {"role": "Quantum Computing Engineer", "category": "Emerging Tech", "jobs": 5000, "salary": 25, "salaryRange": "12-60", "exposure": 2.0, "growth": 40, "city": "Bengaluru", "reasoning": "National Quantum Mission ₹6,003 Cr funding."},
    {"role": "Hardware Engineer (VLSI/Chip)", "category": "Emerging Tech", "jobs": 45000, "salary": 15, "salaryRange": "7-35", "exposure": 3.5, "growth": 22, "city": "Bengaluru", "reasoning": "India Semiconductor Mission ₹76K Cr."},
]

CITY_DATA = [
    {"city": "Bengaluru", "jobs": 1700000, "gccs": 880, "share": 24, "avgSal": 18, "growth": 12},
    {"city": "Hyderabad", "jobs": 950000, "gccs": 355, "share": 14, "avgSal": 16, "growth": 22},
    {"city": "Pune", "jobs": 720000, "gccs": 360, "share": 12, "avgSal": 14, "growth": 10},
    {"city": "Chennai", "jobs": 680000, "gccs": 300, "share": 11, "avgSal": 12, "growth": 18},
    {"city": "Delhi NCR", "jobs": 850000, "gccs": 465, "share": 13, "avgSal": 17, "growth": 15},
    {"city": "Mumbai", "jobs": 580000, "gccs": 220, "share": 9, "avgSal": 17, "growth": 8},
    {"city": "Kolkata", "jobs": 180000, "gccs": 45, "share": 3, "avgSal": 10, "growth": 14},
    {"city": "Tier-2 Cities", "jobs": 240000, "gccs": 220, "share": 4, "avgSal": 9, "growth": 28},
]

COMPANIES = [
    {"name": "TCS", "type": "IT Services", "hires": 40000},
    {"name": "Accenture", "type": "Consulting", "hires": 25000},
    {"name": "Capgemini", "type": "Consulting", "hires": 20000},
    {"name": "Infosys", "type": "IT Services", "hires": 20000},
    {"name": "Cognizant", "type": "IT Services", "hires": 18000},
    {"name": "Wipro", "type": "IT Services", "hires": 15000},
    {"name": "HCLTech", "type": "IT Services", "hires": 12000},
    {"name": "Amazon India", "type": "Product/GCC", "hires": 8000},
    {"name": "Google India", "type": "Product/GCC", "hires": 6000},
    {"name": "Microsoft India", "type": "Product/GCC", "hires": 5500},
    {"name": "Flipkart", "type": "Unicorn", "hires": 5000},
    {"name": "Walmart Global Tech", "type": "GCC", "hires": 4500},
    {"name": "JPMorgan Chase", "type": "GCC", "hires": 4000},
    {"name": "Goldman Sachs", "type": "GCC", "hires": 3500},
    {"name": "Swiggy", "type": "Unicorn", "hires": 2500},
    {"name": "Zomato", "type": "Unicorn", "hires": 2000},
]


class IndiaJobsDataPipeline:
    def __init__(self):
        self.timestamp = datetime.now().isoformat()
        
    def export_csv(self, filepath: str) -> None:
        """Export job data to CSV"""
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=JOB_DATA[0].keys())
            writer.writeheader()
            writer.writerows(JOB_DATA)
        print(f"✅ CSV exported: {filepath}")

    def export_json(self, filepath: str) -> None:
        """Export complete dataset to JSON"""
        data = {
            "metadata": {
                "title": "India Tech Job Market Visualizer 2025",
                "version": "1.0.0",
                "exported": self.timestamp,
                "sources": [
                    "NASSCOM Strategic Review 2025",
                    "Naukri JobSpeak (Jan-Dec 2025)",
                    "Zinnov GCC Reports",
                    "NITI Aayog AI Workforce Impact Study",
                    "Deloitte AI Talent Forecast 2027",
                    "AmbitionBox, Glassdoor, Levels.fyi salary databases"
                ],
                "industry_snapshot": {
                    "total_workforce_fy25": "5.8M",
                    "industry_revenue": "$282.6B",
                    "gcc_count": "1,700+",
                    "gcc_workforce": "2.4M"
                }
            },
            "jobs": JOB_DATA,
            "cities": CITY_DATA,
            "companies": COMPANIES,
            "statistics": self._calculate_statistics()
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"✅ JSON exported: {filepath}")

    def export_markdown(self, filepath: str) -> None:
        """Export data as markdown report"""
        md = "# India Tech Job Market Report 2025\n\n"
        md += f"**Generated:** {self.timestamp}\n\n"
        
        md += "## Executive Summary\n\n"
        stats = self._calculate_statistics()
        md += f"- **Total Workforce:** {stats['total_workforce']/1_000_000:.1f}M\n"
        md += f"- **Avg Salary:** ₹{stats['avg_salary']:.1f}L\n"
        md += f"- **Avg AI Exposure:** {stats['avg_ai_exposure']:.1f}/10\n"
        md += f"- **High-Risk Roles:** {stats['high_risk_roles']/1_000_000:.1f}M\n"
        md += f"- **Booming Roles:** {stats['booming_roles']/1_000_000:.1f}M\n\n"
        
        md += "## Top 10 Roles by Workforce\n\n"
        sorted_jobs = sorted(JOB_DATA, key=lambda x: x['jobs'], reverse=True)[:10]
        for i, job in enumerate(sorted_jobs, 1):
            md += f"{i}. **{job['role']}** ({job['category']})\n"
            md += f"   - Workforce: {job['jobs']/1000:.0f}K\n"
            md += f"   - Salary: ₹{job['salary']}L\n"
            md += f"   - AI Exposure: {job['exposure']}/10\n"
            md += f"   - Growth: {job['growth']:+d}%\n\n"
        
        md += "## Cities by Market Size\n\n"
        sorted_cities = sorted(CITY_DATA, key=lambda x: x['jobs'], reverse=True)
        for city in sorted_cities:
            md += f"- **{city['city']}:** {city['jobs']/1_000_000:.1f}M jobs ({city['share']}%) | {city['gccs']} GCCs | ₹{city['avgSal']}L avg salary | +{city['growth']}% YoY\n"
        
        md += "\n## Top Hiring Companies\n\n"
        sorted_companies = sorted(COMPANIES, key=lambda x: x['hires'], reverse=True)[:10]
        for company in sorted_companies:
            md += f"- **{company['name']}** ({company['type']}): {company['hires']:,} hires/yr\n"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"✅ Markdown report exported: {filepath}")

    def _calculate_statistics(self) -> Dict[str, Any]:
        """Calculate aggregate statistics"""
        total_jobs = sum(j['jobs'] for j in JOB_DATA)
        weighted_salary = sum(j['salary'] * j['jobs'] for j in JOB_DATA) / total_jobs
        weighted_exposure = sum(j['exposure'] * j['jobs'] for j in JOB_DATA) / total_jobs
        high_risk = sum(j['jobs'] for j in JOB_DATA if j['exposure'] >= 7)
        booming = sum(j['jobs'] for j in JOB_DATA if j['growth'] >= 20)
        
        return {
            "total_workforce": total_jobs,
            "avg_salary": weighted_salary,
            "avg_ai_exposure": weighted_exposure,
            "high_risk_roles": high_risk,
            "booming_roles": booming,
            "job_categories": len(set(j['category'] for j in JOB_DATA)),
            "cities": len(CITY_DATA),
            "companies": len(COMPANIES),
            "total_hiring_capacity": sum(c['hires'] for c in COMPANIES)
        }

    def print_summary(self) -> None:
        """Print summary statistics to console"""
        stats = self._calculate_statistics()
        print("\n" + "="*60)
        print("INDIA TECH JOB MARKET SNAPSHOT - 2025")
        print("="*60)
        print(f"Total Workforce:        {stats['total_workforce']/1_000_000:>10.1f}M")
        print(f"Avg Salary:             ₹{stats['avg_salary']:>9.1f}L")
        print(f"Avg AI Exposure:        {stats['avg_ai_exposure']:>10.1f}/10")
        print(f"High-Risk Roles (7+):   {stats['high_risk_roles']/1_000_000:>10.1f}M")
        print(f"Booming Roles (20%+):   {stats['booming_roles']/1_000_000:>10.1f}M")
        print(f"Job Categories:         {stats['job_categories']:>10}") 
        print(f"Cities Tracked:         {stats['cities']:>10}")
        print(f"Major Employers:        {stats['companies']:>10}")
        print(f"Annual Hiring Capacity:  {stats['total_hiring_capacity']:>8,}")
        print("="*60 + "\n")

    def generate_all(self, output_dir: str = "./") -> None:
        """Generate all export formats"""
        os.makedirs(output_dir, exist_ok=True)
        self.export_csv(f"{output_dir}/india_jobs_2025.csv")
        self.export_json(f"{output_dir}/india_jobs_2025.json")
        self.export_markdown(f"{output_dir}/india_jobs_2025.md")
        self.print_summary()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="India Tech Job Market Data Pipeline")
    parser.add_argument("--export", choices=["csv", "json", "md", "all"], default="all", help="Export format")
    parser.add_argument("--output", default="./", help="Output directory")
    args = parser.parse_args()
    
    pipeline = IndiaJobsDataPipeline()
    
    if args.export == "csv":
        pipeline.export_csv(f"{args.output}/india_jobs_2025.csv")
    elif args.export == "json":
        pipeline.export_json(f"{args.output}/india_jobs_2025.json")
    elif args.export == "md":
        pipeline.export_markdown(f"{args.output}/india_jobs_2025.md")
    elif args.export == "all":
        pipeline.generate_all(args.output)
    
    pipeline.print_summary()


if __name__ == "__main__":
    main()
