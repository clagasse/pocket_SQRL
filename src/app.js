// Clean, Task-Oriented SQL Quick Reference + R (tidyverse) Comparison + SQL Writing Overview + R & DB Tools Module
(function () {
  const DATA = window.SQL_REFERENCE_DATA;

  const state = {
    page: 'quickref',        // 'quickref' | 'overview' | 'rtools'
    showRCompare: false,     // Toggle side-by-side R (tidyverse) column on Quick Reference
    activeStep: 1,
    searchQuery: '',
    dialectFilter: 'all',    // 'all' | 'standard' | 'tsql' | 'oracle'
    theme: localStorage.getItem('sql_ref_theme') || 'dark'
  };

  function highlightCode(code) {
    if (!code) return '';
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const tokens = [];
    const save = (html) => {
      const id = `___T${tokens.length}___`;
      tokens.push(html);
      return id;
    };

    // SQL (--) and R (#) single-line comments
    escaped = escaped.replace(/(--[^\n]*|#[^\n]*)/g, (m) => save(`<span class="tok-com">${m}</span>`));
    // Single or double-quoted strings
    escaped = escaped.replace(/('(?:''|[^'])*'|"(?:\\"|[^"])*")/g, (m) => save(`<span class="tok-str">${m}</span>`));

    const kw = /\b(SELECT|DISTINCT|TOP|FROM|WHERE|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|JOIN|ON|APPLY|GROUP\s+BY|ROLLUP|HAVING|ORDER\s+BY|ASC|DESC|LIMIT|OFFSET|FETCH|FIRST|ROWS|ONLY|UNION|ALL|INTERSECT|EXCEPT|MINUS|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|WITH|AS|OVER|PARTITION\s+BY|ROWS\s+BETWEEN|UNBOUNDED|PRECEDING|CURRENT\s+ROW|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|OR\s+ALTER|OR\s+REPLACE|ALTER|DROP|TABLE|VIEW|PROCEDURE|INDEX|PRIMARY\s+KEY|REFERENCES|CHECK|DEFAULT|UNIQUE|ADD|COLUMN|BEGIN|TRANSACTION|COMMIT|ROLLBACK|DECLARE|EXEC|GO|library|if|stop)\b/gi;
    escaped = escaped.replace(kw, (m) => `<span class="tok-kw">${m}</span>`);

    const fn = /\b(COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|NULLIF|ISNULL|NVL|NVL2|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|STRING_AGG|LISTAGG|UPPER|TRIM|REPLACE|SUBSTR|SUBSTRING|CAST|TRY_CAST|EXTRACT|GETDATE|DATEADD|DATEDIFF|YEAR|SYSDATE|TO_DATE|TRUNC|select|transmute|mutate|filter|arrange|distinct|slice_head|slice_max|inner_join|left_join|full_join|anti_join|semi_join|cross_join|bind_rows|summarise|case_when|coalesce|na_if|replace_na|row_number|min_rank|dense_rank|lag|lead|cumsum|dbConnect|dbGetQuery|dbExecute|dbWriteTable|dbAppendTable|dbListTables|dbListObjects|dbListFields|dbDisconnect|dbWithTransaction|odbcListDrivers|glue_sql|read_file|in_schema|Id|glimpse|tbl|show_query|collect|Sys\.getenv)\b/g;
    escaped = escaped.replace(fn, (m) => `<span class="tok-fn">${m}</span>`);

    escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');

    tokens.forEach((html, i) => {
      escaped = escaped.replace(`___T${i}___`, html);
    });
    return escaped;
  }

  function formatBullets(text) {
    return text
      .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono); color:var(--accent); font-size:0.84rem;">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function renderTagBadge(tag) {
    if (tag === 'T-SQL') return `<span class="dialect-tag tag-tsql">T-SQL</span>`;
    if (tag === 'Oracle') return `<span class="dialect-tag tag-oracle">Oracle</span>`;
    return `<span class="dialect-tag tag-general">${tag}</span>`;
  }

  window.setPage = function (pageName) {
    state.page = pageName;
    document.getElementById('page-btn-quickref')?.classList.toggle('active', pageName === 'quickref');
    document.getElementById('page-btn-overview')?.classList.toggle('active', pageName === 'overview');
    document.getElementById('page-btn-rtools')?.classList.toggle('active', pageName === 'rtools');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  };

  window.toggleRCompare = function () {
    state.showRCompare = !state.showRCompare;
    const btn = document.getElementById('r-compare-btn');
    if (btn) {
      btn.classList.toggle('active', state.showRCompare);
      btn.textContent = state.showRCompare ? '✓ Comparing with R (tidyverse)' : '🔄 Compare with R (tidyverse)';
    }
    if (state.page !== 'quickref') {
      window.setPage('quickref');
    } else {
      render();
    }
  };

  window.selectStep = function (stepNum) {
    state.activeStep = stepNum;
    render();
  };

  window.setDialectFilter = function (mode) {
    state.dialectFilter = mode;
    render();
  };

  window.copyCode = function (encoded) {
    const code = decodeURIComponent(encoded);
    navigator.clipboard.writeText(code).then(() => {
      const t = document.getElementById('toast');
      if (!t) return;
      t.classList.add('show');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
    });
  };

  window.toggleTheme = function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('sql_ref_theme', state.theme);
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = state.theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  };

  function renderJoinDiagrams() {
    return `
      <div class="join-visual-strip">
        <div class="join-diagram-box">
          <svg viewBox="0 0 120 56" width="100" height="46">
            <defs><clipPath id="c1"><circle cx="44" cy="28" r="21"/></clipPath></defs>
            <circle cx="44" cy="28" r="21" fill="rgba(148,163,184,0.12)" stroke="#38bdf8" stroke-width="1.6"/>
            <circle cx="76" cy="28" r="21" fill="rgba(148,163,184,0.12)" stroke="#818cf8" stroke-width="1.6"/>
            <circle cx="76" cy="28" r="21" clip-path="url(#c1)" fill="rgba(52,211,153,0.8)"/>
          </svg>
          <div class="join-diagram-label">INNER JOIN</div>
          <div class="join-diagram-sub">Matches in both A &amp; B</div>
        </div>
        <div class="join-diagram-box">
          <svg viewBox="0 0 120 56" width="100" height="46">
            <circle cx="44" cy="28" r="21" fill="rgba(56,189,248,0.65)" stroke="#38bdf8" stroke-width="1.6"/>
            <circle cx="76" cy="28" r="21" fill="rgba(148,163,184,0.12)" stroke="#818cf8" stroke-width="1.6"/>
          </svg>
          <div class="join-diagram-label">LEFT JOIN</div>
          <div class="join-diagram-sub">All of A + matching B</div>
        </div>
        <div class="join-diagram-box">
          <svg viewBox="0 0 120 56" width="100" height="46">
            <circle cx="44" cy="28" r="21" fill="rgba(56,189,248,0.65)" stroke="#38bdf8" stroke-width="1.6"/>
            <circle cx="76" cy="28" r="21" fill="#0f172a" stroke="#818cf8" stroke-width="1.6"/>
          </svg>
          <div class="join-diagram-label">LEFT JOIN (IS NULL)</div>
          <div class="join-diagram-sub">Rows in A with no B match</div>
        </div>
        <div class="join-diagram-box">
          <svg viewBox="0 0 120 56" width="100" height="46">
            <circle cx="44" cy="28" r="21" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" stroke-width="1.6"/>
            <circle cx="76" cy="28" r="21" fill="rgba(129,140,248,0.6)" stroke="#818cf8" stroke-width="1.6"/>
          </svg>
          <div class="join-diagram-label">FULL OUTER JOIN</div>
          <div class="join-diagram-sub">All rows from A and B</div>
        </div>
      </div>
    `;
  }

  // Render Page 1: Command Quick Reference
  function renderQuickRefPage(toc, main) {
    toc.innerHTML = `
      <div class="toc-heading">🐿️ The Acorn Stash</div>
      <ul class="toc-list">
        <li>
          <a class="toc-link" href="#how-sql-runs">
            <span class="toc-num">🌰</span>
            <span>In a Nutshell: Execution Order</span>
          </a>
        </li>
        ${DATA.sections.map((sec) => `
          <li>
            <a class="toc-link" href="#${sec.id}">
              <span class="toc-num">${sec.number}.</span>
              <span>${sec.title}</span>
            </a>
          </li>
        `).join('')}
      </ul>

      <div class="toc-heading" style="margin-top: 1.5rem;">🥜 R Comparison</div>
      <div style="padding:0 0.3rem; margin-bottom: 1.25rem;">
        <button class="theme-btn r-toggle-btn ${state.showRCompare ? 'active' : ''}" style="width:100%; text-align:left;"
                onclick="window.toggleRCompare()">
          ${state.showRCompare ? '✓ R (tidyverse) Shown' : '🔄 Show R (tidyverse)'}
        </button>
      </div>

      <div class="toc-heading">🌲 Dialect Filter</div>
      <div style="display:flex; flex-direction:column; gap:0.3rem; padding:0 0.3rem;">
        <button class="theme-btn" style="text-align:left; border-color:${state.dialectFilter === 'all' ? 'var(--accent)' : 'var(--border)'};"
                onclick="window.setDialectFilter('all')">
          ✓ Whole Stash (All)
        </button>
        <button class="theme-btn" style="text-align:left; border-color:${state.dialectFilter === 'standard' ? 'var(--accent)' : 'var(--border)'};"
                onclick="window.setDialectFilter('standard')">
          Standard SQL Only
        </button>
        <button class="theme-btn" style="text-align:left; border-color:${state.dialectFilter === 'tsql' ? 'var(--accent)' : 'var(--border)'};"
                onclick="window.setDialectFilter('tsql')">
          Standard + T-SQL
        </button>
        <button class="theme-btn" style="text-align:left; border-color:${state.dialectFilter === 'oracle' ? 'var(--accent)' : 'var(--border)'};"
                onclick="window.setDialectFilter('oracle')">
          Standard + Oracle
        </button>
      </div>
    `;

    const step = DATA.parsingSteps.find((s) => s.step === state.activeStep) || DATA.parsingSteps[0];
    const q = state.searchQuery.trim().toLowerCase();

    const parsingHtml = !q ? `
      <section id="how-sql-runs" class="parsing-card">
        <h1 class="parsing-title">🌰 SQL in a Nutshell: How SQL Reads &amp; Runs a Query (1 → 8)</h1>
        <p class="parsing-subtitle">
          You write a SQL query starting with <code>SELECT</code>, but the database actually runs the clauses in the <strong>1 → 8 order below</strong> (which is the exact same top-to-bottom order as an R <code>tidyverse</code> pipe!). Click any step to see why it matters.
        </p>

        <div class="steps-row">
          ${DATA.parsingSteps.map((s) => `
            <button class="step-btn ${state.activeStep === s.step ? 'active' : ''}"
                    onclick="window.selectStep(${s.step})">
              <div class="step-num">STEP ${s.step}</div>
              <div class="step-name">${s.clause}</div>
              <div class="step-written">${s.writtenOrder}</div>
              ${state.showRCompare ? `<div class="step-r-verb">${s.rPipe}</div>` : ''}
            </button>
          `).join('')}
        </div>

        <div class="step-detail-box">
          <div class="step-detail-title">
            <span>🌰 Step ${step.step}: ${step.clause} <span style="font-weight:400; color:var(--text-dim); font-size:0.82rem;">(${step.writtenOrder} in SQL)</span></span>
            <span class="dialect-tag tag-general" style="font-family:var(--font-mono);">R pipe: ${step.rPipe}</span>
          </div>
          <div>${step.shortDesc}</div>
          <div class="step-detail-why">🥜 <strong>Why this matters:</strong> ${step.whyItMatters}</div>
        </div>
      </section>
    ` : '';

    const sectionsHtml = DATA.sections.map((sec) => {
      const filteredItems = sec.items.filter((item) => {
        if (state.dialectFilter === 'standard' && (item.tags.includes('T-SQL') || item.tags.includes('Oracle'))) {
          return false;
        }
        if (state.dialectFilter === 'tsql' && item.tags.includes('Oracle') && !item.tags.includes('T-SQL')) {
          return false;
        }
        if (state.dialectFilter === 'oracle' && item.tags.includes('T-SQL') && !item.tags.includes('Oracle')) {
          return false;
        }
        if (!q) return true;
        return (
          item.command.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.rCode && item.rCode.toLowerCase().includes(q)) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      });

      if (filteredItems.length === 0) return '';

      return `
        <section id="${sec.id}" class="guide-section">
          <div class="section-header">
            <div class="section-title-row">
              <span class="section-num-badge">${sec.number}</span>
              <h2 class="section-title">${sec.title}</h2>
            </div>
            <p class="section-subtitle">${sec.subtitle}</p>
          </div>

          ${sec.hasJoinDiagram && !q ? renderJoinDiagrams() : ''}

          <div class="command-list">
            ${filteredItems.map((item) => {
              const encodedSql = encodeURIComponent(item.code);
              const encodedR = encodeURIComponent(item.rCode || '');
              return `
                <div class="command-row ${state.showRCompare ? 'with-r-compare' : ''}">
                  <div class="cmd-info">
                    <div class="cmd-header">
                      <span class="cmd-name">${item.command}</span>
                      ${item.tags.map(renderTagBadge).join('')}
                    </div>
                    <p class="cmd-desc">${item.desc}</p>
                  </div>

                  <div class="cmd-code-wrap">
                    <div class="code-lang-header">
                      <span>SQL</span>
                      <button class="copy-btn" onclick="window.copyCode('${encodedSql}')">🌰 Copy</button>
                    </div>
                    <pre class="cmd-pre"><code>${highlightCode(item.code)}</code></pre>
                  </div>

                  ${state.showRCompare ? `
                    <div class="cmd-code-wrap r-box">
                      <div class="code-lang-header r-header">
                        <span>R (tidyverse / dplyr)</span>
                        <button class="copy-btn" onclick="window.copyCode('${encodedR}')">🌰 Copy</button>
                      </div>
                      <pre class="cmd-pre"><code>${highlightCode(item.rCode)}</code></pre>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }).join('');

    main.innerHTML = parsingHtml + (sectionsHtml || `<div class="parsing-card"><p>🐿️ No acorns found in the stash matching <strong>"${state.searchQuery}"</strong>. Try foraging for another keyword!</p></div>`);
  }

  // Generic Renderer for Structured Guide Pages (Page 2: Writing & Structuring SQL, Page 3: R Connections & DB Tools)
  function renderStructuredGuidePage(toc, main, config) {
    toc.innerHTML = `
      <div class="toc-heading">${config.tocTitle}</div>
      <ul class="toc-list">
        ${config.items.map((sec) => `
          <li>
            <a class="toc-link" href="#${sec.id}">
              <span class="toc-num">${sec.number}.</span>
              <span>${sec.title}</span>
            </a>
          </li>
        `).join('')}
      </ul>

      <div style="margin-top:2rem; padding:0.85rem; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; font-size:0.78rem; color:var(--text-muted);">
        <strong style="color:var(--text-main); display:block; margin-bottom:0.3rem;">${config.helpTitle}</strong>
        ${config.helpText}
      </div>
    `;

    const q = state.searchQuery.trim().toLowerCase();
    const filtered = config.items.filter((sec) => {
      if (!q) return true;
      return (
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        (sec.leftCode && sec.leftCode.toLowerCase().includes(q)) ||
        (sec.rightCode && sec.rightCode.toLowerCase().includes(q)) ||
        (sec.explanation && sec.explanation.some((e) => e.toLowerCase().includes(q))) ||
        (sec.comparisonTable && sec.comparisonTable.rows.some((r) => r.some((c) => c.toLowerCase().includes(q))))
      );
    });

    main.innerHTML = `
      <div style="margin-bottom:2rem;">
        <h1 style="font-size:1.55rem; font-weight:800; margin-bottom:0.35rem;">${config.heroTitle}</h1>
        <p style="color:var(--text-muted); font-size:0.95rem;">
          ${config.heroSubtitle}
        </p>
      </div>

      ${filtered.map((sec) => {
        const hasCode = Boolean(sec.leftCode || sec.rightCode);
        const encLeft = encodeURIComponent(sec.leftCode || '');
        const encRight = encodeURIComponent(sec.rightCode || '');
        const isLeftR = sec.leftLabel && (sec.leftLabel.includes('R') || sec.leftLabel.includes('DBI') || sec.leftLabel.includes('odbc') || sec.leftLabel.includes('glue'));
        const isRightR = sec.rightLabel && (sec.rightLabel.includes('R') || sec.rightLabel.includes('dbplyr') || sec.rightLabel.includes('DuckDB') || sec.rightLabel.includes('Transaction'));

        return `
          <article id="${sec.id}" class="overview-card">
            <div class="section-title-row" style="margin-bottom:0.4rem;">
              <span class="section-num-badge">${sec.number}</span>
              <h2 class="section-title">${sec.title}</h2>
            </div>
            <p class="section-subtitle" style="font-size:0.93rem;">${sec.summary}</p>

            ${sec.explanation ? `
              <ul class="overview-bullets">
                ${sec.explanation.map((b) => `<li>• ${formatBullets(b)}</li>`).join('')}
              </ul>
            ` : ''}

            ${sec.comparisonTable ? `
              <div class="comp-table-wrap">
                <table class="comp-table">
                  <thead>
                    <tr>
                      ${sec.comparisonTable.headers.map((h) => `<th>${h}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${sec.comparisonTable.rows.map((row) => `
                      <tr>
                        ${row.map((cell) => `<td>${cell}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            ${hasCode ? `
              <div class="overview-code-grid">
                <div class="cmd-code-wrap ${isLeftR ? 'r-box' : ''}">
                  <div class="code-lang-header ${isLeftR ? 'r-header' : ''}">
                    <span>${sec.leftLabel}</span>
                    <button class="copy-btn" onclick="window.copyCode('${encLeft}')">🌰 Copy</button>
                  </div>
                  <pre class="cmd-pre"><code>${highlightCode(sec.leftCode)}</code></pre>
                </div>

                <div class="cmd-code-wrap ${isRightR ? 'r-box' : ''}">
                  <div class="code-lang-header ${isRightR ? 'r-header' : ''}">
                    <span>${sec.rightLabel}</span>
                    <button class="copy-btn" onclick="window.copyCode('${encRight}')">🌰 Copy</button>
                  </div>
                  <pre class="cmd-pre"><code>${highlightCode(sec.rightCode)}</code></pre>
                </div>
              </div>
            ` : ''}
          </article>
        `;
      }).join('')}
    `;
  }

  function render() {
    const toc = document.getElementById('toc-sidebar');
    const main = document.getElementById('main-content');
    if (!toc || !main) return;

    if (state.page === 'overview') {
      renderStructuredGuidePage(toc, main, {
        tocTitle: '📘 Writing & Structuring SQL',
        items: DATA.overviewGuide,
        heroTitle: '📘 How to Write, String Together & Structure SQL Code',
        heroSubtitle: 'Squirreling away clean query habits: translating from R <code>tidyverse</code> mental models, chaining multi-step queries (CTEs vs. Temp Tables), and choosing between Tables, Views, and Stored Procedures.',
        helpTitle: '🐿️ Working in R?',
        helpText: 'Check out the <strong>🐿️ R Connections &amp; DB Tools</strong> tab above for copy-paste R connection recipes and database tools.'
      });
    } else if (state.page === 'rtools') {
      renderStructuredGuidePage(toc, main, {
        tocTitle: '🐿️ R Connections & DB Tools',
        items: DATA.rToolsGuide,
        heroTitle: '🐿️ Connecting to Databases in R & Data Management Tools',
        heroSubtitle: 'How to connect R to SQL Server, Oracle, SQLite, and DuckDB; explore unfamiliar schemas; parameterize <code>.sql</code> files with <code>glue_sql()</code>; upload data safely inside transactions; and choose the right SQL client tools.',
        helpTitle: '🥜 Quick Tip',
        helpText: 'Squirrel away your database usernames and passwords in your <code>.Renviron</code> file (<code>usethis::edit_r_environ()</code>) and read them with <code>Sys.getenv()</code> so credentials are never committed to Git.'
      });
    } else {
      renderQuickRefPage(toc, main);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', state.theme);
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = state.theme === 'dark' ? '☀️ Light' : '🌙 Dark';

    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        render();
      });
    }

    render();
  });
})();
