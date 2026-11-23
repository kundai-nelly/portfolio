# Kundai Nelly Semu — Data Science & Analytics Portfolio

[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=111111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-Data%20Science-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-3NF%20%26%20Star%20Schema-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-1B6B4A.svg)](LICENSE)

> **Central message:** I use data analysis, statistical reasoning, programming and analytical tools to investigate problems and produce evidence-based insights.

This repository hosts the portfolio website of **Kundai Nelly Semu**, a **Software Engineer with a BSc in Information Technology (Data Science)** completed at **Eduvos, South Africa**, seeking a **Junior Data Scientist** or **Junior Data Analyst** opportunity.

Live site: **[https://kundai-nelly.github.io/portfolio/](https://kundai-nelly.github.io/portfolio/)**

---

## Flagship Projects Featured

The portfolio presents four completed flagship data science and analytics case studies, each backed by verified metrics, visual evidence, explicit methodological caveats, and an in-browser interactive model or scenario runner:

| # | Project | Analytical Scope & Stack | Verified Key Findings & Evidence | Repository & Demo Links |
| ---: | :--- | :--- | :--- | :--- |
| **01** | **Diabetes Risk Screening** | Synthetic 10,000-patient Type 2 diabetes screening study; pipeline audit, 6-model comparison, in-fold SMOTE, Optuna, SHAP (`LinearExplainer`), and 5-page Streamlit app. | Repaired 5 silent pipeline bugs (including 8 dropped boolean clinical risk factors and structural `parity` nulls). All 6 classifiers score **0.9995–0.9998 CV ROC-AUC** because a simple diagnostic threshold check (`fasting_glucose >= 126` or `hba1c >= 6.5`) matches the synthetic label **99.24%** of the time. | [GitHub](https://github.com/kundai-nelly/diabetes-risk-model) · [Live Streamlit App](https://diabetes-risk-model-npibg7jed4gpfc277mjpjs.streamlit.app/) |
| **02** | **Employee Attrition Prediction** | Workforce retention analysis on 1,470 IBM HR employee records (237 leavers, **16.12%** base rate); feature ablation testing, 4-classifier comparison, in-fold SMOTE, and Streamlit app. | Overtime staff leave at **30.53% vs. 10.44%** without (~3×); **Sales Representative** leads role turnover at **39.76%**. **Logistic Regression** leads CV ROC-AUC (**0.8287**; held-out test ROC-AUC **0.8134**, recall **0.6809**, precision **0.4000**). Engineered features improve held-out AUC from `0.7965` to `0.8134`. | [GitHub](https://github.com/kundai-nelly/attrition-prediction-model) · [Live Streamlit App](https://attrition-prediction-model-qt44rggygstz7w64ciuape.streamlit.app/) |
| **03** | **Credit Risk Assessment** | Consumer credit default risk modelling across **32,581** loan records (**21.82%** default rate, 11 applicant/loan inputs); `GridSearchCV` Random Forest + SMOTE pipeline and threshold tuning in Streamlit. | Lifts held-out test default recall from **56.75%** (Decision Tree baseline) to **74.12%** and test ROC-AUC from **0.8736** to **0.9202**. Persists the F1-optimized decision threshold (**0.62**, F1 **0.8011**, recall **0.6997**) alongside the fitted pipeline in `credit_risk_production_model.pkl`. | [GitHub](https://github.com/kundai-nelly/credit_risk_assessment_analysis_project) |
| **04** | **GrainFlow Analytics** | Smallholder Grain Aggregation, Storage & Logistics Intelligence Platform (`SEED=42`, **56,479** synthetic rows); PostgreSQL 16.4 (15 3NF tables, 11 star-schema views), 7 EDA notebooks, 12-sheet Excel financial model (`ZAR`), and Power BI semantic model (`model.bim`, 78 DAX measures, M queries, 6 SVG blueprints, HTML simulator). | **57/57** automated tests passing with **0.00** variance across 36 control totals. Reconciled **36,000 MT** rated capacity across 8 depots (53 critical / 149 warning breach days; 93.44% peak at Lichtenburg), **R 8,400,432.67** farmer quality downgrade loss (351 multi-breach lots), **R 2,222,447.99** physical shrinkage proxy (320.33 MT), **+R 1,322,271.99** (+15%) fuel shock under Method A, and **R 445,518.96** simulated benchmark offset under Option M3 (20% long-haul road-to-rail shift). | [GitHub](https://github.com/kundai-nelly/grainflow-analytics) · [Interactive HTML Simulator](assets/images/projects/grainflow-analytics/grainflow_dashboard.html) |

---

## Repository Structure

```text
portfolio/
├── index.html                                    # Semantic HTML5 entry point & case-study modal sheets
├── assets/
│   ├── css/
│   │   └── styles.css                            # Design tokens, typography, layout, responsive & theme rules
│   ├── js/
│   │   └── main.js                               # Navigation, modal focus management, lightbox & model runners
│   └── images/
│       └── projects/
│           ├── diabetes-risk-screening/          # EDA, leakage check, model comparison, SHAP & app screenshot
│           ├── employee-attrition-prediction/    # Role/overtime/satisfaction charts, coefficients & app screenshot
│           ├── credit-risk-assessment/           # Feature importance, confusion matrix, distributions & app screenshot
│           └── grainflow-analytics/              # 3NF/Star-schema ERD, architecture diagram, 6 SVGs & HTML simulator
├── LICENSE                                       # MIT License
└── README.md                                     # Portfolio documentation
```

---

## Running Locally

The portfolio is a zero-build static website compatible with GitHub Pages (`/portfolio/` base path via relative asset URLs).

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

---

## License

This project is licensed under the [MIT License](LICENSE).
