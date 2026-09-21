# Kundai Semu - Systems Engineer & Data Analyst Portfolio

A single-page personal portfolio for Kundai Nelly Semu, showcasing data science work and systems engineering experience from Harare, Zimbabwe.

The portfolio presents machine learning projects including diabetes risk screening, employee attrition, telecom churn, and a credit risk application, alongside house-price modelling, an interactive calendar application, server administration, database work, and reporting experience.

## Tech Stack

- Native HTML5 with semantic sections and accessible interactive controls
- CSS3 with custom properties, responsive layout rules, Flexbox, and CSS Grid
- Modular JavaScript using browser APIs and ES6-compatible patterns
- Python, SQL, pandas, NumPy, scikit-learn, Streamlit, Tableau, and Power BI in the featured project work
- Google Fonts: Newsreader, IBM Plex Sans, and IBM Plex Mono

## Local Development

No build step or package installation is required.

### Option 1: Open Directly

Open `index.html` in a modern browser.

### Option 2: Use Python's Local Server

From the repository root:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

### Option 3: VS Code Live Server

Open the repository in VS Code, right-click `index.html`, and choose **Open with Live Server**.

## Directory Structure

```text
portfolio/
├── index.html                         # Production entry point
├── kundai semu portfolio.html         # Original working copy
├── Kundai_Nelly_Semu_CV.docx          # Downloadable CV
├── README.md                           # Project documentation
├── LICENSE                             # MIT license
├── .editorconfig                       # Editor consistency rules
├── .gitignore                          # Repository exclusions
└── assets/
    ├── css/
    │   └── styles.css                  # Portfolio styling and design tokens
    ├── js/
    │   └── main.js                     # Theme, filters, modals, runners, and calendar
    └── images/                         # Optional external project assets
```

The current chart previews are embedded in `index.html` as base64 data so the portfolio remains self-contained. New or optimized image assets should be placed in `assets/images/`.

## Deployment

### GitHub Pages

1. Push the repository to GitHub.
2. In **Settings > Pages**, select **Deploy from a branch**.
3. Select the production branch and the `/ (root)` folder.
4. Save the configuration and wait for GitHub Pages to publish the site.

Because `index.html` is at the repository root, no additional build command is needed.

### Netlify

1. Import the GitHub repository into Netlify.
2. Set the build command to empty.
3. Set the publish directory to `.`.
4. Deploy the site.

Before production deployment, replace placeholder canonical and Open Graph metadata in `index.html` with the final public domain and add a real social preview image if one is available.

## Interactive Features

- Light and dark theme switching with local-storage persistence
- Project filtering by modelling, analysis, and app categories
- Keyboard-aware project modal sheet with Escape and backdrop close behavior
- Chart lightbox controls with accessible labels
- Client-side model demonstration runners
- Clipboard email action with toast feedback
- Interactive calendar sketch with keyboard-accessible day controls
- Automatic footer year and update-date population

## Accessibility and Performance

The page includes a skip link, semantic landmarks, visible focus styles, labelled dialogs, live status regions, descriptive chart alt text, reduced-motion support, and lazy-loaded chart images. The external CSS and JavaScript files keep the HTML entry point easier to cache and maintain.

Before publishing, test keyboard-only navigation, screen-reader dialog behavior, color contrast, external links, mobile layouts, and the final canonical URL at 320px, 375px, 768px, and desktop widths.

## License

The source code is available under the MIT License. See [LICENSE](LICENSE).
