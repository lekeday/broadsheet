/**
 * Lagos State Pupil Score Sheet & Broadsheet Calculator
 * Alpine.js Core Logic & Utilities
 */

const SUBJECT_KEYS = [
      'maths', 'english', 'quantitative', 'vReasoning',
      'bst', 'yoruba', 'crsIrs', 'ccaDrawing',
      'historyCivic', 'pvs', 'nve'
    ];

    const DEFAULT_PUPILS = [
      {
        id: 1,
        name: "ADEBAYO, Oluwaseun Emmanuel",
        admNo: "LAS/2026/014",
        status: "FA",
        maths: 88, english: 82, quantitative: 90, vReasoning: 85,
        bst: 92, yoruba: 78, crsIrs: 86, ccaDrawing: 80,
        historyCivic: 84, pvs: 88, nve: 91, bf: 920
      },
      {
        id: 2,
        name: "OKONKWO, Chidinma Grace",
        admNo: "LAS/2026/021",
        status: "FA",
        maths: 94, english: 89, quantitative: 96, vReasoning: 91,
        bst: 95, yoruba: 74, crsIrs: 90, ccaDrawing: 85,
        historyCivic: 89, pvs: 93, nve: 95, bf: 975
      },
      {
        id: 3,
        name: "BELLO, Farouk Ayomide",
        admNo: "LAS/2026/007",
        status: "FA",
        maths: 72, english: 68, quantitative: 75, vReasoning: 70,
        bst: 78, yoruba: 82, crsIrs: 74, ccaDrawing: 76,
        historyCivic: 70, pvs: 75, nve: 80, bf: 760
      },
      {
        id: 4,
        name: "DANJUMA, Aisha Fatima",
        admNo: "LAS/2026/033",
        status: "SA",
        maths: 64, english: 71, quantitative: 60, vReasoning: 66,
        bst: 70, yoruba: 65, crsIrs: 79, ccaDrawing: 72,
        historyCivic: 68, pvs: 67, nve: 73, bf: 690
      },
      {
        id: 5,
        name: "WILLIAMS, David Babatunde",
        admNo: "LAS/2026/042",
        status: "FA",
        maths: 48, english: 52, quantitative: 45, vReasoning: 50,
        bst: 55, yoruba: 58, crsIrs: 60, ccaDrawing: 62,
        historyCivic: 53, pvs: 56, nve: 54, bf: 510
      }
    ];

    function reportSheetApp() {
      return {
        schoolInfo: {
          name: "Keke Primary School",
          lgea: "IKEJA",
          schoolCode: "LG/IKJ/042",
          classArm: "Primary 5",
          session: "2025/2026",
          term: "2nd Term"
        },
        sidebarOpen: true, // Collapsible sidebar state
        searchQuery: '',
        rankingBasis: 'grandTotal', // 'grandTotal', 'total', or 'average'
        verticalHeaders: true, // Default to true (rotated vertical headers for subjects/summaries)
        sortKey: '',
        sortAsc: false,
        pupils: [],

        // Bulk upload modal state
        showBulkModal: false,
        bulkMode: 'file', // 'file' or 'paste'
        bulkText: '',
        uploadAction: 'replace', // 'replace' or 'append'
        uploadError: '',

        init() {
          const savedData = localStorage.getItem('lagos_pupils_scores');
          const savedInfo = localStorage.getItem('lagos_school_info');
          const savedRanking = localStorage.getItem('lagos_ranking_basis');
          const savedVertical = localStorage.getItem('lagos_vertical_headers');

          if (savedVertical !== null) {
            this.verticalHeaders = savedVertical === 'true';
          }

          if (savedData) {
            try {
              this.pupils = JSON.parse(savedData);
            } catch (e) {
              this.pupils = JSON.parse(JSON.stringify(DEFAULT_PUPILS));
            }
          } else {
            this.pupils = JSON.parse(JSON.stringify(DEFAULT_PUPILS));
          }

          if (savedInfo) {
            try {
              this.schoolInfo = JSON.parse(savedInfo);
            } catch (e) {}
          }

          if (savedRanking) {
            this.rankingBasis = savedRanking;
          }

          this.$watch('verticalHeaders', (val) => {
            localStorage.setItem('lagos_vertical_headers', val);
          });

          this.$watch('pupils', (val) => {
            localStorage.setItem('lagos_pupils_scores', JSON.stringify(val));
          }, { deep: true });

          this.$watch('schoolInfo', (val) => {
            localStorage.setItem('lagos_school_info', JSON.stringify(val));
          }, { deep: true });

          this.$watch('rankingBasis', (val) => {
            localStorage.setItem('lagos_ranking_basis', val);
          });
        },

        // Core Calculations
        calculateTotal(pupil) {
          let sum = 0;
          SUBJECT_KEYS.forEach(key => {
            const val = parseFloat(pupil[key]);
            if (!isNaN(val)) sum += val;
          });
          return Math.round(sum * 10) / 10;
        },

        calculateGrandTotal(pupil) {
          const total = this.calculateTotal(pupil);
          const bf = parseFloat(pupil.bf) || 0;
          return Math.round((total + bf) * 10) / 10;
        },

        calculateAverage(pupil) {
          const total = this.calculateTotal(pupil);
          const avg = total / SUBJECT_KEYS.length;
          return Number(avg.toFixed(1));
        },

        isInvalidScore(val) {
          if (val === '' || val === null || val === undefined) return false;
          const n = Number(val);
          return isNaN(n) || n < 0 || n > 100;
        },

        // Metric to rank on
        getRankScore(pupil) {
          if (this.rankingBasis === 'total') {
            return this.calculateTotal(pupil);
          } else if (this.rankingBasis === 'average') {
            return this.calculateAverage(pupil);
          }
          return this.calculateGrandTotal(pupil);
        },

        // Position Map calculation with Standard Competition Ranking
        getRankingMap() {
          const sorted = [...this.pupils].map(p => ({
            id: p.id,
            score: this.getRankScore(p)
          })).sort((a, b) => b.score - a.score);

          const rankMap = {};
          let currentRank = 1;
          for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i].score < sorted[i - 1].score) {
              currentRank = i + 1;
            }
            rankMap[sorted[i].id] = currentRank;
          }
          return rankMap;
        },

        getOrdinal(n) {
          const s = ["th", "st", "nd", "rd"];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        },

        getPositionText(pupil) {
          if (this.pupils.length === 0) return '-';
          const ranks = this.getRankingMap();
          const rank = ranks[pupil.id];
          return rank ? this.getOrdinal(rank) : '-';
        },

        getPositionBadgeClass(pupil) {
          const ranks = this.getRankingMap();
          const rank = ranks[pupil.id];
          if (rank === 1) return 'pos-1';
          if (rank === 2) return 'pos-2';
          if (rank === 3) return 'pos-3';
          return 'pos-other';
        },

        getRemark(pupil) {
          const avg = this.calculateAverage(pupil);
          if (avg >= 75) return "Distinction";
          if (avg >= 65) return "Very Good";
          if (avg >= 50) return "Credit / Pass";
          if (avg >= 40) return "Fair";
          return "Needs Help";
        },

        getRemarkBadgeClass(pupil) {
          const avg = this.calculateAverage(pupil);
          if (avg >= 75) return "remark-distinction";
          if (avg >= 60) return "remark-credit";
          if (avg >= 50) return "remark-pass";
          return "remark-fail";
        },

        // Sorting
        sortByPosition() {
          const ranks = this.getRankingMap();
          this.pupils.sort((a, b) => (ranks[a.id] || 9999) - (ranks[b.id] || 9999));
          this.sortKey = 'position';
          this.sortAsc = true;
        },

        sortColumn(key) {
          if (this.sortKey === key) {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortKey = key;
            this.sortAsc = key === 'name' || key === 'admNo';
          }

          const multiplier = this.sortAsc ? 1 : -1;

          this.pupils.sort((a, b) => {
            let valA, valB;
            if (key === 'total') {
              valA = this.calculateTotal(a);
              valB = this.calculateTotal(b);
            } else if (key === 'grandTotal') {
              valA = this.calculateGrandTotal(a);
              valB = this.calculateGrandTotal(b);
            } else if (key === 'average') {
              valA = this.calculateAverage(a);
              valB = this.calculateAverage(b);
            } else {
              valA = a[key] ?? '';
              valB = b[key] ?? '';
            }

            if (typeof valA === 'string') {
              return multiplier * valA.localeCompare(valB);
            }
            return multiplier * (valA - valB);
          });
        },

        get displayPupils() {
          if (!this.searchQuery.trim()) {
            return this.pupils;
          }
          const q = this.searchQuery.toLowerCase();
          return this.pupils.filter(p => 
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.admNo && p.admNo.toLowerCase().includes(q)) ||
            (p.status && p.status.toLowerCase().includes(q))
          );
        },

        // Aggregates
        get classAverage() {
          if (this.pupils.length === 0) return 0;
          let sum = 0;
          this.pupils.forEach(p => {
            sum += this.calculateAverage(p);
          });
          return (sum / this.pupils.length).toFixed(1);
        },

        get highestScoreVal() {
          if (this.pupils.length === 0) return 0;
          const scores = this.pupils.map(p => this.getRankScore(p));
          return Math.max(...scores);
        },

        get lowestScoreVal() {
          if (this.pupils.length === 0) return 0;
          const scores = this.pupils.map(p => this.getRankScore(p));
          return Math.min(...scores);
        },

        get passRate() {
          if (this.pupils.length === 0) return 0;
          const passes = this.pupils.filter(p => this.calculateAverage(p) >= 50).length;
          return Math.round((passes / this.pupils.length) * 100);
        },

        subjectMean(subjectKey) {
          if (this.pupils.length === 0) return '0.0';
          let sum = 0;
          let count = 0;
          this.pupils.forEach(p => {
            const val = parseFloat(p[subjectKey]);
            if (!isNaN(val)) {
              sum += val;
              count++;
            }
          });
          return count > 0 ? (sum / count).toFixed(1) : '0.0';
        },

        addPupil() {
          const newId = Date.now() + Math.floor(Math.random() * 1000);
          const nextIndex = this.pupils.length + 1;
          const padIndex = String(nextIndex).padStart(3, '0');
          this.pupils.push({
            id: newId,
            name: "",
            admNo: `LAS/2026/${padIndex}`,
            status: "FA",
            maths: 0, english: 0, quantitative: 0, vReasoning: 0,
            bst: 0, yoruba: 0, crsIrs: 0, ccaDrawing: 0,
            historyCivic: 0, pvs: 0, nve: 0, bf: 0
          });
        },

        removePupil(id) {
          if (confirm("Are you sure you want to remove this pupil?")) {
            this.pupils = this.pupils.filter(p => p.id !== id);
          }
        },

        clearAllPupils() {
          if (confirm("Clear all pupils from this sheet? This cannot be undone.")) {
            this.pupils = [];
          }
        },

        loadSampleData() {
          if (confirm("Reset sheet with sample Lagos State pupil records?")) {
            this.pupils = JSON.parse(JSON.stringify(DEFAULT_PUPILS));
            this.sortByPosition();
          }
        },

        // Bulk Upload Handling
        handleFileUpload(event) {
          const file = event.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (e) => {
            this.parseAndApplyData(e.target.result);
            event.target.value = '';
          };
          reader.onerror = () => {
            this.uploadError = "Failed to read file.";
          };
          reader.readAsText(file);
        },

        processBulkUpload() {
          this.uploadError = '';
          if (this.bulkMode === 'paste') {
            if (!this.bulkText.trim()) {
              this.uploadError = "Please paste data before processing.";
              return;
            }
            this.parseAndApplyData(this.bulkText);
          }
        },

        parseCSVLine(line, delimiter) {
          const result = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === delimiter && !inQuotes) {
              result.push(cur.trim());
              cur = '';
            } else {
              cur += char;
            }
          }
          result.push(cur.trim());
          return result;
        },

        parseAndApplyData(rawContent) {
          try {
            const lines = rawContent.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
            if (lines.length === 0) {
              this.uploadError = "No data rows found.";
              return;
            }

            // Determine delimiter (tab or comma)
            const firstLine = lines[0];
            const delimiter = firstLine.includes('\t') ? '\t' : ',';

            let startIndex = 0;
            const headerTokens = this.parseCSVLine(firstLine.toLowerCase(), delimiter);
            
            // Check if first row is a header
            const isHeader = headerTokens.some(t => 
              t.includes('name') || t.includes('adm') || t.includes('math') || t.includes('pupil') || t.includes('s/n')
            );
            if (isHeader) {
              startIndex = 1;
            }

            const parsedPupils = [];
            let timestamp = Date.now();

            for (let i = startIndex; i < lines.length; i++) {
              const cols = this.parseCSVLine(lines[i], delimiter);
              if (cols.length < 2) continue;

              let offset = 0;
              // If first column is purely numeric S/N, advance offset
              if (!isNaN(cols[0]) && cols[0] !== '' && cols.length >= 14) {
                offset = 1;
              }

              const name = cols[offset] ? cols[offset].replace(/^["']|["']$/g, '') : `Pupil ${i + 1}`;
              const admNo = cols[offset + 1] ? cols[offset + 1].replace(/^["']|["']$/g, '') : `LAS/${i + 1}`;
              const rawStatus = cols[offset + 2] ? cols[offset + 2].toUpperCase().trim() : 'FA';
              const status = ['FA', 'SA'].includes(rawStatus) ? rawStatus : (rawStatus.startsWith('S') ? 'SA' : 'FA');

              // 11 Subjects
              const maths = parseFloat(cols[offset + 3]) || 0;
              const english = parseFloat(cols[offset + 4]) || 0;
              const quantitative = parseFloat(cols[offset + 5]) || 0;
              const vReasoning = parseFloat(cols[offset + 6]) || 0;
              const bst = parseFloat(cols[offset + 7]) || 0;
              const yoruba = parseFloat(cols[offset + 8]) || 0;
              const crsIrs = parseFloat(cols[offset + 9]) || 0;
              const ccaDrawing = parseFloat(cols[offset + 10]) || 0;
              const historyCivic = parseFloat(cols[offset + 11]) || 0;
              const pvs = parseFloat(cols[offset + 12]) || 0;
              const nve = parseFloat(cols[offset + 13]) || 0;
              
              // If B/F column exists (cols[offset + 15] or similar)
              let bf = 0;
              if (cols[offset + 15] !== undefined && !isNaN(parseFloat(cols[offset + 15]))) {
                bf = parseFloat(cols[offset + 15]) || 0;
              } else if (cols[offset + 14] !== undefined && !isNaN(parseFloat(cols[offset + 14]))) {
                bf = parseFloat(cols[offset + 14]) || 0;
              }

              parsedPupils.push({
                id: timestamp++,
                name,
                admNo,
                status,
                maths, english, quantitative, vReasoning,
                bst, yoruba, crsIrs, ccaDrawing,
                historyCivic, pvs, nve,
                bf
              });
            }

            if (parsedPupils.length === 0) {
              this.uploadError = "Could not parse any valid student rows. Please verify formatting.";
              return;
            }

            if (this.uploadAction === 'replace') {
              this.pupils = parsedPupils;
            } else {
              this.pupils = [...this.pupils, ...parsedPupils];
            }

            // Immediately sort to find positions
            this.sortByPosition();

            this.bulkText = '';
            this.showBulkModal = false;
            alert(`Successfully processed and computed scores for ${parsedPupils.length} pupils!`);
          } catch (err) {
            console.error(err);
            this.uploadError = "Error parsing upload: " + err.message;
          }
        },

        downloadTemplate() {
          const headers = [
            "S/N", "Name of pupils", "Adm. No", "STATUS",
            "MATHS/NUMBER WORK", "ENGLISH/LETTER WORK", "QUANTITATIVE",
            "V.REASONING/READING", "BST", "YORUBA", "CRS/IRS/HEALTH HABIT",
            "CCA/DRAWING", "HISTORY/CIVIC EDU.", "PVS/PHYSICAL DEV.",
            "NVE/SOCIAL HABIT", "B/F"
          ];

          const sampleRows = [
            [1, '"OLANIYI, Samuel Tolu"', "LAS/2026/050", "FA", 85, 80, 88, 82, 89, 75, 84, 78, 80, 85, 90, 820],
            [2, '"EZENWA, Ngozi Blessing"', "LAS/2026/051", "FA", 92, 88, 95, 90, 94, 80, 89, 85, 86, 90, 92, 910]
          ];

          const csvText = [headers.join(','), ...sampleRows.map(e => e.join(','))].join('\r\n');
          const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `Lagos_Scores_Bulk_Template.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },

        exportCSV() {
          if (this.pupils.length === 0) {
            alert("No pupil data to export.");
            return;
          }

          const headers = [
            "S/N", "Name of pupils", "Adm. No", "STATUS",
            "MATHS/NUMBER WORK", "ENGLISH/LETTER WORK", "QUANTITATIVE",
            "V.REASONING/READING", "BST", "YORUBA", "CRS/IRS/HEALTH HABIT",
            "CCA/DRAWING", "HISTORY/CIVIC EDU.", "PVS/PHYSICAL DEV.",
            "NVE/SOCIAL HABIT", "TOTAL", "B/F", "GRAND TOTAL",
            "AVERAGE%", "POSITION", "REMARKS"
          ];

          const rows = this.displayPupils.map((p, idx) => [
            idx + 1,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${p.admNo || ''}"`,
            p.status || 'FA',
            p.maths ?? 0,
            p.english ?? 0,
            p.quantitative ?? 0,
            p.vReasoning ?? 0,
            p.bst ?? 0,
            p.yoruba ?? 0,
            p.crsIrs ?? 0,
            p.ccaDrawing ?? 0,
            p.historyCivic ?? 0,
            p.pvs ?? 0,
            p.nve ?? 0,
            this.calculateTotal(p),
            p.bf ?? 0,
            this.calculateGrandTotal(p),
            this.calculateAverage(p),
            `"${this.getPositionText(p)}"`,
            `"${this.getRemark(p)}"`
          ]);

          const csvText = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
          const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `Lagos_State_Score_Sheet_${new Date().toISOString().slice(0,10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      };
    }
