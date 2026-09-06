# Lagos State Student Report & Score Sheet (Alpine.js)

A lightweight, high-performance web application powered by **Alpine.js** and Vanilla CSS designed for primary and basic schools to calculate and manage student scores.

## Features Implemented

### 1. 📄 Calibrated A4 Portrait Print Layout & Interspacing
- **Fits A4 Portrait Setup (`210mm × 297mm`)**: Configured with `@page { size: A4 portrait; margin: 4mm 3mm 5mm 3mm; }` to fit all 20+ columns without overflowing or clipping.
- **Appropriate Column Interspacing**:
  - `S/N`: ~22px
  - `Name of Pupils`: ~58px (proportional, legible with text ellipsis)
  - `Adm. No`: ~32px
  - `STATUS`: ~30px
  - **11 Subjects & Score Summaries (`TOTAL`, `B/F`, `GRAND TOTAL`, `AVERAGE%`)**: ~25px each
  - `POSITION`: ~30px
  - `REMARKS`: ~35px
- **Vertical Rotated Headers**: Keeps subject and metric headers slim and compact, leaving ample vertical space for all student rows on standard portrait paper.
- **Interactive Orientation Switcher**: Includes an easy one-click toolbar toggle (`📐 Headers: Vertical` / `📏 Headers: Horizontal`) to switch layout styles at any time with preference saved in `localStorage`.

---

### 2. 📤 Bulk Upload of Scores
- **Two Flexible Input Modes**:
  1. **File Upload**: Drag and drop or browse `.csv`, `.tsv`, or `.txt` spreadsheets.
  2. **Direct Copy-Paste**: Paste table cells directly from **Microsoft Excel**, **Google Sheets**, or CSV files.
- **Auto-Detection & Parsing**:
  - Automatically identifies header rows and skips them.
  - Automatically detects comma (`,`) or tab (`\t`) delimiters.
  - Choice to either **Append** to existing pupils or **Replace / Overwrite** the broadsheet.
- **CSV Template Download**: Single-click "CSV Template" download button providing ready-to-fill column structures with sample rows.

---

### 3. 🧮 Automatic Computation of Grand Total & Term Total
- **Term Total**: Instant sum of all 11 subject scores:
  - `MATHS/NUMBER WORK`, `ENGLISH/LETTER WORK`, `QUANTITATIVE`, `V.REASONING/READING`, `BST`, `YORUBA`, `CRS/IRS/HEALTH HABIT`, `CCA/DRAWING`, `HISTORY/CIVIC EDU.`, `PVS/PHYSICAL DEV.`, `NVE/SOCIAL HABIT`.
- **B/F (Brought Forward)**: Enter or import previous term cumulative scores.
- **Grand Total**: Real-time sum:
  $$\text{Grand Total} = \text{Term Total} + \text{B/F}$$

---

### 4. 📊 Average in Percentage
- Real-time calculation:
  $$\text{Average \%} = \frac{\text{Term Total}}{11}$$
- Formatted neatly to 1 decimal place with `%` symbol.
- Integrated with Lagos State Grading Benchmarks (Distinction, Very Good, Credit, Fair, Needs Help).

---

### 5. 🏆 Sorting to Find Positions
- **"Sort by Position" Button**: Instantly rearranges the whole class by ranking (1st, 2nd, 3rd...).
- **Configurable Ranking Criteria**: Rank pupils based on:
  - `GRAND TOTAL (Term Total + B/F)` *(Default)*
  - `TERM TOTAL`
  - `AVERAGE %`
- **Standard Competition Ranking (1224)**: Tied scores automatically share the same position rank (e.g. joint 1st).
- **Interactive Column Sorting**: Click on any table header (Pupil Name, Adm No, Grand Total, Average %, Term Total, or Subjects) to sort in ascending or descending order.

---

## Getting Started
Simply open [index.html](file:///home/leke/apps/AI/Lagosstatereportsheet/index.html) in any web browser. No server or build tools needed.
