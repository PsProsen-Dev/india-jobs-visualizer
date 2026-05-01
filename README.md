# India Tech Job Market Visualizer 2025

[![GitHub stars](https://img.shields.io/github/stars/PsProsen-Dev/india-jobs-viz?style=flat-square)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Data Sources](https://img.shields.io/badge/data-NASSCOM%20%7C%20Naukri%20%7C%20Zinnov-orange?style=flat-square)]()

Interactive visualization of India's tech job market with AI exposure scoring, salary analysis, and hiring trends across 49+ roles, 8 cities, and 16+ top companies.

**Inspired by:** [Andrej Karpathy's karpathy/jobs](https://github.com/karpathy/jobs)  
**Live Demo:** Open `india_jobs_visualizer.html` in any modern browser

---

## 🎯 Overview

This repository contains a **production-grade, zero-dependencies** India tech job market visualizer built on Karpathy's methodology:

- **49 roles** across 8 categories (Software Engineering, Data & AI/ML, Cloud & DevOps, Cybersecurity, Product & Design, QA & Testing, IT Services, Emerging Tech)
- **Interactive treemap** with 4 color modes: AI Exposure, Salary, Growth, Category
- **8 major cities** with hiring distribution and specialization data
- **16+ top hiring companies** from IT services to unicorns to GCCs
- **Real data** from NASSCOM, Naukri JobSpeak, Zinnov, NITI Aayog, Deloitte, AmbitionBox, Glassdoor, Levels.fyi
- **AI Exposure scoring** (0–10 rubric): digital-native + remote work scores higher; physical/specialized work scores lower

---

## 📦 What's Included

### 1. **india_jobs_visualizer.html** (Standalone, No Build Required)
- Zero dependencies: D3.js + Chart.js from CDN
- Fully interactive treemap, bar charts, city cards, company listings
- 6 tabs: Overview, Jobs by Role, Cities, Skills & Trends, Top Hirers, Data Export
- CSV/JSON export built-in
- **Deploy directly** to GitHub Pages, Vercel, Netlify, or any static host

### 2. **india_jobs_visualizer.jsx** (React Component)
- Full React 18 + TypeScript + Tailwind CSS + Lucide Icons
- Advanced state management, responsive design
- Suitable for integration into Next.js apps or design systems
- Contains all 49 jobs + detailed tooltips

### 3. **data_pipeline.py** (Python ETL Script)
- Export to CSV, JSON, Markdown
- Aggregate statistics calculation
- Extensible for API integrations (Naukri, LinkedIn, etc.)
- Run: `python data_pipeline.py --export all`

---

## 🚀 Quick Start

### Option A: Use HTML File (Recommended for Fastest Deployment)
```bash
# Download the HTML file
curl -O https://raw.githubusercontent.com/PsProsen-Dev/india-jobs-viz/main/india_jobs_visualizer.html

# Open in browser
open india_jobs_visualizer.html

# Or serve locally
python3 -m http.server 8000
# Visit http://localhost:8000/india_jobs_visualizer.html
```

### Option B: Deploy to GitHub Pages
```bash
# 1. Fork or clone this repo
git clone https://github.com/PsProsen-Dev/india-jobs-viz.git
cd india-jobs-viz

# 2. Place HTML in docs/ folder (or root)
mkdir -p docs
cp india_jobs_visualizer.html docs/index.html

# 3. Enable Pages in Settings → Pages → Source: main/docs

# 4. Access at https://yourusername.github.io/india-jobs-viz
```

### Option C: Deploy to Vercel/Netlify
```bash
# Create a simple vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "public": true,
  "builds": [
    {
      "src": "india_jobs_visualizer.html",
      "use": "@vercel/static-build",
      "config": { "distDir": "." }
    }
  ]
}
EOF

# Or just drag & drop HTML to Netlify
```

### Option D: Use Python Pipeline
```bash
# Install (no external deps needed)
python3 data_pipeline.py --export all --output ./output

# Outputs:
# - india_jobs_2025.csv
# - india_jobs_2025.json
# - india_jobs_2025.md
```

---

## 📊 Data Sources & Attribution

| Source | Data | Coverage |
|--------|------|----------|
| **NASSCOM Strategic Review 2025** | Industry revenue, workforce, GCC stats | Annual macro snapshot |
| **Naukri JobSpeak Index** | Hiring trends, month-by-month YoY growth | Jan–Dec 2025 |
| **Zinnov GCC Reports** | GCC locations, workforce, new center launches | FY25 + 2025 forecasts |
| **NITI Aayog** | AI automation displacement forecast | 2–10 year outlook |
| **Deloitte AI Talent Report** | AI/ML talent demand projection | 2025–2027 |
| **LinkedIn Economic Graph** | City-level hiring, skill demand | Real-time trends |
| **AmbitionBox, Glassdoor, Levels.fyi** | Salary benchmarks, compensation data | Crowd-sourced 2025 |

---

## 🎨 Features

### Treemap Visualization
- **Area** = Total workforce in role
- **Color** = AI Exposure (0–10), Salary (₹3L–₹35L+), YoY Growth (-25% to +40%), or Category
- **Hover** = Detailed tooltip with role, salary range, growth, reasoning
- **Search** = Filter by role name (e.g., "AI Engineer", "Java")
- **Category Filter** = Drill into specific job categories

### Data Insights
- **AI/ML Hiring Boom**: +18% to +54% YoY growth across 2025 (Naukri JobSpeak)
- **GCC Dominance**: 1,700+ centers, 2.4M workforce, 27% of IT hiring (up from 15% in 2024)
- **City Concentration**: Bengaluru (24%), Hyderabad (14%), Pune (12%), Chennai (11%), Delhi NCR (13%), Mumbai (9%), Others (17%)
- **Declining Roles**: Manual QA (-25%), IT Support (-18%), Technical Writing (-20%)
- **Booming Roles**: AI Engineer (+60%), ML Engineer (+35%), Data Engineer (+25%), Cloud Engineer (+28%)
- **Salary Dispersion**: Services freshers ₹3.5–7L; FAANG seniors ₹1–1.5Cr; AI/ML premium +20–30%

### Export Options
- **CSV**: For Excel, Tableau, Power BI analysis
- **JSON**: For integrations, custom apps, API backends
- **Markdown**: For documentation, reports, GitHub

---

## 🛠️ Customization

### Add New Jobs
Edit the `JOB_DATA` array in HTML or `data_pipeline.py`:
```javascript
{
  role: "New Role Name",
  category: "Category Name",
  jobs: 100000,  // workforce count
  salary: 20,    // median LPA
  salaryRange: "10-40",
  exposure: 5.5, // 0-10 scale
  growth: 15,    // YoY %
  city: "City",
  reasoning: "Why this exposure score"
}
```

### Change Color Scale
Modify `exposureColor()`, `salaryColor()`, or `growthColor()` functions in HTML.

### Update Data Programmatically
```python
# Scrape Naukri JobSpeak
import requests
response = requests.get("https://www.naukri.com/blog/...")
# Parse and update JOB_DATA
```

---

## 📈 Key Metrics & Statistics

### Market Snapshot (FY2025)
- **Total IT Workforce**: 5.8M (+2.2% YoY)
- **Industry Revenue**: $282.6B (+5.1% YoY)
- **Net New Hires**: ~126,000 (vs. 60K in FY24)
- **GCC Hiring**: 100K+ net adds (vs. ~11K at IT services majors)
- **AI Talent Demand**: Projected to grow 600K → 1.25M by 2027 (Deloitte)

### Salary Benchmarks (2025)
| Role | Fresher | Mid-Level | Senior |
|------|---------|-----------|---------|
| Software Engineer | ₹6–12L | ₹15–25L | ₹40–60L |
| Data Scientist | ₹6–10L | ₹15L (median) | ₹25–35L |
| AI/ML Engineer | ₹8–15L | ₹25–35L (premium) | ₹50L–1Cr+ |
| Product Manager | — | ₹25–40L | ₹50–80L |
| DevOps/SRE | ₹8–12L | ₹17–22L | ₹30–50L |

### Top Companies & Hiring
1. **TCS** — 40K freshers (NQT program) | Top 5 IT firms target 82K total FY26
2. **Accenture** — 25K hires/yr (Consulting)
3. **Google/Amazon/Microsoft India** — 6K–8K hires/yr (GCC + product)
4. **Walmart Global Tech (India)** — 4.5K hires (Hyderabad GCC)
5. **Flipkart/Swiggy/Zomato** — Unicorn startups collectively ~10K hires

---

## ⚠️ Important Notes

### Data Limitations
- **Workforce estimates** synthesized from NASSCOM, Naukri, Zinnov, LinkedIn reports
- **Salary ranges** are averages; individual offers vary by company, experience, negotiation
- **AI Exposure** scores are qualitative assessments (0–10 rubric), not quantitative models
- **Growth projections** reflect 12-month YoY trends (Jan–Dec 2025); subject to macroeconomic change

### Disclaimers
- Not an investment recommendation or official economic study
- Used for research, education, career planning, policy discussion
- Always cross-reference with primary sources (NASSCOM, government reports)
- Salary data from crowd-sourced platforms may contain outliers

---

## 🔗 Related Links

- **NASSCOM**: https://nasscom.in
- **Naukri JobSpeak**: https://www.naukri.com/blog/tag/naukri-jobspeak/
- **Zinnov**: https://www.zinnov.com
- **NITI Aayog AI Studies**: https://niti.gov.in
- **Deloitte India**: https://www.deloitte.com/in
- **Original Inspiration**: https://github.com/karpathy/jobs & https://karpathy.ai/jobs

---

## 📜 License

MIT License — Feel free to fork, modify, redistribute.

```
© 2025 Prosenjit Paul (PsProsen-Dev)
Inspired by Andrej Karpathy's karpathy/jobs project
Data: NASSCOM, Naukri, Zinnov, public sources
```

---

## 🚀 Next Steps

### Extend the Visualizer
- [ ] **Real-time Naukri API integration** → Auto-update job postings
- [ ] **Regional salary heatmap** → State-by-state compensation analysis
- [ ] **Skill gap analysis** → In-demand skills vs. talent supply
- [ ] **AI exposure automation** → LLM scoring via Gemini Flash (karpathy/jobs model)
- [ ] **GitHub Actions workflow** → Daily data refreshes, CI/CD deployment

### Contribute
1. Fork the repo
2. Add new job data or cities
3. Improve AI exposure logic
4. Submit PR

### Deploy Your Own
```bash
git clone https://github.com/[YourUsername]/india-jobs-viz.git
cd india-jobs-viz
# Customize JOB_DATA in HTML
# Push to GitHub
# Enable Pages in Settings
```

---

## 📞 Support & Contact

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions, ideas, feedback
- **Email**: [Your contact info if applicable]
- **Twitter**: [@ProsenPs](https://twitter.com/ProsenPs)

---

**Last Updated:** May 2025  
**Data Snapshot:** FY2025 (April 2024 – March 2025)  
**Next Refresh:** June 2025 (with Naukri H1 2025 data)

