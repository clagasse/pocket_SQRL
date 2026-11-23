# 🐿️ Pocket SQRL — SQL Quick Reference & Lookup (`SQL` + `R`)

> *"Squirreling away the SQL & R database commands you always forget."*

**Pocket SQRL** (**S**QL **Q**uick **R**eference & **L**ookup) is an interactive, zero-build reference guide for writing **Standard SQL** (with tags for **SQL Server T-SQL** and **Oracle PL/SQL**), comparing every SQL pattern against **R (`tidyverse` / `dplyr`)**, and connecting R workflows to databases.

---

## ✨ What's in Pocket SQRL?

1. **⚡ Command Quick Reference (with `🔄 Compare with R (tidyverse)`)**
   - **⚙️ How SQL Reads a Query (1 → 8 Execution Order)**: Visual step-by-step strip showing how SQL's internal execution order (`FROM/JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `DISTINCT` → `ORDER BY` → `LIMIT`) matches an R `tidyverse` pipe (`df |> left_join() |> filter() |> summarise() |> arrange() |> slice_head()`).
   - **8 Task-Oriented Command Sections**:
     1. *Selecting, Sorting & Limiting Rows* (`SELECT`, `DISTINCT`, `ORDER BY`, `LIMIT`, `FETCH FIRST`, `TOP`, `ROWNUM`)
     2. *Filtering Rows (`WHERE`)* (`=`, `<>`, `AND`/`OR`, `IN`, `BETWEEN`, `LIKE`, `IS NULL`, `EXISTS`)
     3. *Joining & Combining Tables* (Visual `JOIN` Venn diagrams + `INNER`, `LEFT`, Anti-Join, `FULL OUTER`, `CROSS`, `UNION ALL`, `INTERSECT`, `EXCEPT`)
     4. *Summarizing & Grouping Data* (`COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING`, `SUM(CASE WHEN ...)` pivot, `ROLLUP`, `STRING_AGG`/`LISTAGG`)
     5. *Conditional Logic & Handling `NULL`s* (`CASE WHEN`, `COALESCE`, `NULLIF`, `ISNULL`, `NVL`)
     6. *CTEs (`WITH`), Subqueries & Window Functions (`OVER`)* (`WITH`, `ROW_NUMBER`/`RANK`/`DENSE_RANK`, Top-N per group, `LAG`/`LEAD`, running totals)
     7. *Everyday Text, Date & Math Functions* (Text cleaning, `CAST`, fixing the integer division trap, `TRY_CAST`, date extraction & arithmetic)
     8. *Creating Tables & Modifying Data* (`INSERT`, `UPDATE`, `DELETE`, `BEGIN`/`ROLLBACK`/`COMMIT`, `CREATE/ALTER TABLE`, `VIEW`, `INDEX`)
2. **📘 Writing & Structuring SQL (Overview Guide)**
   - **The Mental Model**: Translating between declarative SQL and step-by-step R (`tidyverse`) pipes.
   - **Stringing SQL Together**: Chaining steps with **`WITH` CTEs** vs. multi-statement scripts with **Temporary Tables (`#temp`)**.
   - **Tables vs. Views vs. Temp Tables vs. CTEs**: Comparison matrix + creating and querying reusable `CREATE VIEW` definitions.
   - **Variables & Stored Procedures**: Parameterizing scripts (`DECLARE @var`) and creating/calling `CREATE PROCEDURE`.
3. **🔌 R Connections & Database Tools**
   - **The R Database Stack**: When to use `DBI`, `odbc`, `RSQLite`, `duckdb`, `dbplyr`, and `glue` (`glue_sql()`).
   - **Connection Recipes**: Connecting R to **SQL Server** (Windows Trusted Auth & DSNs), **Oracle** (`.Renviron` credentials), **SQLite**, and **DuckDB** (including querying `.parquet` files directly with SQL).
   - **Exploring Unfamiliar Databases**: `dbListTables()`, `dbListObjects()`, `dbListFields()`, `INFORMATION_SCHEMA`, and lazy `dbplyr` previews.
   - **Organizing `.sql` Files & Writing Data**: Parameterizing `.sql` templates with `glue_sql()`, `dbWriteTable()` vs. `dbAppendTable()`, `#temp` staging table bulk updates, and `DBI::dbWithTransaction()`.
   - **Recommended SQL GUI & Data Tools**: **DBeaver**, **SSMS**, **Oracle SQL Developer**, **RStudio / Positron / VS Code**, **DB Browser for SQLite**, and **DuckDB**.

---

## 🚀 Opening Locally (Zero Server Required)

Double-click **[`index.html`](index.html)** in File Explorer to open it directly in your browser, or serve locally with:

```powershell
python -m http.server 8080
```

---

## 🌐 Hosting `pocket_SQRL` on GitHub Pages

1. Push this repository to GitHub (`pocket_SQRL`).
2. In your GitHub repo, go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch** (`main` / `/ (root)`) or **GitHub Actions** (uses [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).
4. Your site will be live at `https://<your-username>.github.io/pocket_SQRL/`.
