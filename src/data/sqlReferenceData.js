// Clean, Task-Oriented SQL Quick Reference + R (tidyverse) Equivalents + SQL Writing Overview + R & DB Tools Module
// Standard SQL by default; dialect-specific items use subtle tags: ["T-SQL"] or ["Oracle"]

window.SQL_REFERENCE_DATA = {
  // 1. Visual Overview: Written Order vs. Actual Execution Order (and how it matches R tidyverse pipes!)
  parsingSteps: [
    {
      step: 1,
      clause: "FROM & JOIN",
      writtenOrder: "Written 2nd",
      rPipe: "df |> left_join(other, by = ...)",
      shortDesc: "Gathers the source tables and joins them together based on ON conditions.",
      whyItMatters: "Table aliases (like FROM surveys AS s) are created here, so every later step can use them. Notice this is Step 1 in an R tidyverse pipe!"
    },
    {
      step: 2,
      clause: "WHERE",
      writtenOrder: "Written 3rd",
      rPipe: "|> filter(...)",
      shortDesc: "Filters out individual rows that don't meet your conditions.",
      whyItMatters: "Because SELECT hasn't run yet (Step 5), you CANNOT use SELECT column aliases inside WHERE. You also can't use SUM() or COUNT() here."
    },
    {
      step: 3,
      clause: "GROUP BY",
      writtenOrder: "Written 4th",
      rPipe: "|> group_by(...)  (or .by = ...)",
      shortDesc: "Combines remaining rows into summary buckets (one row per unique group).",
      whyItMatters: "Once you use GROUP BY, every column in your SELECT list must either be in GROUP BY or inside an aggregate like COUNT(), SUM(), or AVG()."
    },
    {
      step: 4,
      clause: "HAVING",
      writtenOrder: "Written 5th",
      rPipe: "|> summarise(...) |> filter(...)",
      shortDesc: "Filters the summary groups created by GROUP BY.",
      whyItMatters: "Use WHERE to filter raw rows before grouping; use HAVING to filter aggregated totals (like HAVING COUNT(*) >= 5)."
    },
    {
      step: 5,
      clause: "SELECT",
      writtenOrder: "Written 1st",
      rPipe: "|> select(...) / mutate(...) / summarise(...)",
      shortDesc: "Calculates the final columns, formulas, window functions (OVER), and creates column aliases (AS).",
      whyItMatters: "Column aliases created with AS only exist from this point forward—meaning only ORDER BY can use them!"
    },
    {
      step: 6,
      clause: "DISTINCT",
      writtenOrder: "After SELECT",
      rPipe: "|> distinct()",
      shortDesc: "Removes duplicate rows from the selected output columns.",
      whyItMatters: "Checks uniqueness across all selected columns together, not just the first column."
    },
    {
      step: 7,
      clause: "ORDER BY",
      writtenOrder: "Written 6th",
      rPipe: "|> arrange(...)",
      shortDesc: "Sorts the final results (ASC = lowest to highest, DESC = highest to lowest).",
      whyItMatters: "Since SELECT already ran in Step 5, you CAN use your SELECT column aliases here."
    },
    {
      step: 8,
      clause: "LIMIT / TOP / FETCH",
      writtenOrder: "Written Last",
      rPipe: "|> slice_head(n = ...)",
      shortDesc: "Cuts off the sorted output after the requested number of rows.",
      whyItMatters: "Always pair with ORDER BY, otherwise you get an arbitrary set of rows."
    }
  ],

  // 2. Quick Reference Sections (Each item includes SQL code + R tidyverse equivalent!)
  sections: [
    {
      id: "sec-select",
      number: "1",
      title: "Selecting, Sorting & Limiting Rows",
      subtitle: "The core building blocks of every query: choosing columns, removing duplicates, sorting, and grabbing the top rows.",
      items: [
        {
          command: "SELECT ... FROM",
          tags: [],
          desc: "Retrieve specific columns (or * for all columns) from a table, calculate new columns, and rename with AS.",
          code: `SELECT 
    station_id,
    station_name AS site,
    depth_m * 3.281 AS depth_ft
FROM stations;`,
          rCode: `stations |>
  transmute(
    station_id,
    site     = station_name,
    depth_ft = depth_m * 3.281
  )
# Or select(station_id, site = station_name) + mutate(...)`
        },
        {
          command: "SELECT DISTINCT",
          tags: [],
          desc: "Return only unique values (or unique combinations of columns), removing duplicates.",
          code: `SELECT DISTINCT region, gear_type
FROM surveys;`,
          rCode: `surveys |>
  distinct(region, gear_type)`
        },
        {
          command: "ORDER BY",
          tags: [],
          desc: "Sort results ascending (ASC, the default) or descending (DESC) by one or more columns.",
          code: `SELECT species_name, weight_kg, sample_date
FROM catches
ORDER BY weight_kg DESC, sample_date ASC;`,
          rCode: `catches |>
  select(species_name, weight_kg, sample_date) |>
  arrange(desc(weight_kg), sample_date)`
        },
        {
          command: "LIMIT / OFFSET",
          tags: ["Standard / SQLite / Postgres"],
          desc: "Return only the first N rows (and optionally skip rows for pagination).",
          code: `SELECT * FROM catches
ORDER BY weight_kg DESC
LIMIT 10 OFFSET 0;`,
          rCode: `catches |>
  arrange(desc(weight_kg)) |>
  slice_head(n = 10) # Or slice(1:10)`
        },
        {
          command: "FETCH FIRST n ROWS ONLY",
          tags: ["ANSI / Oracle / T-SQL"],
          desc: "Standard SQL syntax supported in Oracle (12c+) and SQL Server (2012+) to limit rows after ORDER BY.",
          code: `SELECT * FROM catches
ORDER BY weight_kg DESC
FETCH FIRST 10 ROWS ONLY;`,
          rCode: `catches |>
  slice_max(order_by = weight_kg, n = 10, with_ties = FALSE)`
        },
        {
          command: "SELECT TOP (n)",
          tags: ["T-SQL"],
          desc: "SQL Server shorthand placed right after SELECT to limit output to the top N rows (or TOP (n) WITH TIES).",
          code: `SELECT TOP (10) species_name, weight_kg
FROM dbo.catches
ORDER BY weight_kg DESC;`,
          rCode: `catches |>
  select(species_name, weight_kg) |>
  slice_max(order_by = weight_kg, n = 10)`
        },
        {
          command: "ROWNUM <= n",
          tags: ["Oracle"],
          desc: "Legacy Oracle row limit. Warning: ROWNUM is assigned before ORDER BY, so wrap sorted queries in a subquery first.",
          code: `SELECT * FROM (
    SELECT species_name, weight_kg FROM catches ORDER BY weight_kg DESC
) WHERE ROWNUM <= 10;`,
          rCode: `catches |>
  select(species_name, weight_kg) |>
  arrange(desc(weight_kg)) |>
  slice_head(n = 10)`
        }
      ]
    },
    {
      id: "sec-where",
      number: "2",
      title: "Filtering Rows (WHERE)",
      subtitle: "Narrow down which rows are included using comparisons, lists, ranges, text wildcards, and NULL checks.",
      items: [
        {
          command: "WHERE (=, <>, <, >, AND, OR)",
          tags: [],
          desc: "Filter rows before grouping. Wrap OR conditions in parentheses so AND doesn't override them.",
          code: `SELECT * FROM surveys
WHERE survey_year >= 2022
  AND status <> 'CANCELLED'
  AND (region = 'North' OR region = 'West');`,
          rCode: `surveys |>
  filter(
    survey_year >= 2022,
    status != "CANCELLED",
    region == "North" | region == "West"
  )`
        },
        {
          command: "IN (...)",
          tags: [],
          desc: "Match any value in a list (cleaner than chaining multiple OR conditions).",
          code: `SELECT * FROM catches
WHERE species_code IN ('COD', 'HAL', 'SAB');`,
          rCode: `catches |>
  filter(species_code %in% c("COD", "HAL", "SAB"))`
        },
        {
          command: "BETWEEN ... AND ...",
          tags: [],
          desc: "Match an inclusive range (includes both the start and end values).",
          code: `SELECT * FROM stations
WHERE depth_m BETWEEN 50 AND 200
  AND sample_date BETWEEN '2024-01-01' AND '2024-12-31';`,
          rCode: `stations |>
  filter(
    between(depth_m, 50, 200),
    between(sample_date, as.Date("2024-01-01"), as.Date("2024-12-31"))
  )`
        },
        {
          command: "LIKE ('%' and '_')",
          tags: [],
          desc: "Match text patterns: % matches any number of characters; _ matches a single character.",
          code: `SELECT * FROM species
WHERE common_name LIKE 'Pacific%'    -- Starts with 'Pacific'
   OR station_code LIKE 'ST___01';   -- 'ST' + any 3 chars + '01'`,
          rCode: `species |>
  filter(
    stringr::str_starts(common_name, "Pacific") |
    stringr::str_detect(station_code, "^ST...01$")
  )`
        },
        {
          command: "IS NULL / IS NOT NULL",
          tags: [],
          desc: "Check for missing values (NA in R). Never use = NULL or <> NULL in SQL.",
          code: `SELECT * FROM catches
WHERE length_cm IS NULL
  AND weight_kg IS NOT NULL;`,
          rCode: `catches |>
  filter(is.na(length_cm), !is.na(weight_kg))`
        },
        {
          command: "EXISTS / NOT EXISTS",
          tags: [],
          desc: "Filter a table based on whether a matching row exists in another table (Semi-Join / Anti-Join).",
          code: `SELECT s.station_id, s.station_name
FROM stations s
WHERE NOT EXISTS (
    SELECT 1 FROM tows t WHERE t.station_id = s.station_id
);`,
          rCode: `# Anti-join keeps rows in stations with NO match in tows:
stations |>
  anti_join(tows, by = "station_id")
# (For EXISTS, use semi_join(stations, tows, by = "station_id"))`
        }
      ]
    },
    {
      id: "sec-joins",
      number: "3",
      title: "Joining & Combining Tables",
      subtitle: "Link related tables side-by-side using shared keys (JOIN), or stack two query results on top of each other (UNION).",
      hasJoinDiagram: true,
      items: [
        {
          command: "INNER JOIN",
          tags: [],
          desc: "Keep only rows that have a matching key in BOTH tables.",
          code: `SELECT t.tow_id, s.station_name, c.weight_kg
FROM tows t
INNER JOIN stations s ON t.station_id = s.station_id
INNER JOIN catches  c ON t.tow_id = c.tow_id;`,
          rCode: `tows |>
  inner_join(stations, by = "station_id") |>
  inner_join(catches,  by = "tow_id") |>
  select(tow_id, station_name, weight_kg)`
        },
        {
          command: "LEFT JOIN",
          tags: [],
          desc: "Keep ALL rows from the left table, and attach matching rows from the right table (fills NULL/NA when no match exists).",
          code: `SELECT t.tow_id, c.species_id, c.weight_kg
FROM tows t
LEFT JOIN catches c 
    ON t.tow_id = c.tow_id 
   AND c.species_id = 105; -- Put right-table filters in ON to keep 0-catch tows!`,
          rCode: `tows |>
  left_join(
    catches |> filter(species_id == 105),
    by = "tow_id"
  ) |>
  select(tow_id, species_id, weight_kg)`
        },
        {
          command: "LEFT JOIN ... WHERE IS NULL",
          tags: [],
          desc: "Anti-Join pattern: find rows in the left table that have NO matching record in the right table.",
          code: `SELECT s.station_id, s.station_name
FROM stations s
LEFT JOIN tows t ON s.station_id = t.station_id
WHERE t.tow_id IS NULL; -- Stations that were never sampled`,
          rCode: `stations |>
  anti_join(tows, by = "station_id")`
        },
        {
          command: "FULL OUTER JOIN",
          tags: [],
          desc: "Keep all rows from both tables, matching them where possible and filling NULL/NA on either side when unmatched.",
          code: `SELECT COALESCE(a.id, b.id) AS id, a.value_2023, b.value_2024
FROM summary_2023 a
FULL OUTER JOIN summary_2024 b ON a.id = b.id;`,
          rCode: `summary_2023 |>
  full_join(summary_2024, by = "id")`
        },
        {
          command: "CROSS JOIN",
          tags: [],
          desc: "Pair every row of Table A with every row of Table B (Cartesian grid, e.g., all Tows × all Target Species).",
          code: `SELECT t.tow_id, sp.species_name
FROM tows t
CROSS JOIN species sp;`,
          rCode: `tidyr::expand_grid(
  tow_id       = tows$tow_id,
  species_name = species$species_name
) # Or dplyr::cross_join(tows, species)`
        },
        {
          command: "UNION ALL / UNION",
          tags: [],
          desc: "Stack rows from two tables with matching columns. UNION ALL keeps all rows; UNION deduplicates.",
          code: `SELECT station_id, temp_c, '2023' AS yr FROM readings_2023
UNION ALL
SELECT station_id, temp_c, '2024' AS yr FROM readings_2024;`,
          rCode: `# UNION ALL equivalent (fast row stack):
bind_rows(
  readings_2023 |> mutate(yr = "2023"),
  readings_2024 |> mutate(yr = "2024")
)
# For deduplicated UNION: dplyr::union(df1, df2)`
        },
        {
          command: "INTERSECT & EXCEPT (MINUS)",
          tags: [],
          desc: "INTERSECT returns rows present in both queries. EXCEPT (MINUS in Oracle) returns rows in query 1 missing from query 2.",
          code: `SELECT species_id FROM catches_2023
EXCEPT  -- (Use MINUS in legacy Oracle)
SELECT species_id FROM catches_2024;`,
          rCode: `# EXCEPT / MINUS equivalent:
dplyr::setdiff(
  catches_2023 |> select(species_id),
  catches_2024 |> select(species_id)
)
# For INTERSECT: dplyr::intersect(df1, df2)`
        }
      ]
    },
    {
      id: "sec-group",
      number: "4",
      title: "Summarizing & Grouping Data",
      subtitle: "Calculate totals, counts, and averages across categories with GROUP BY, and filter those summaries with HAVING.",
      items: [
        {
          command: "COUNT, SUM, AVG, MIN, MAX",
          tags: [],
          desc: "Core aggregate functions. Note: SQL automatically ignores NULLs inside SUM/AVG/MIN/MAX (like na.rm = TRUE in R).",
          code: `SELECT 
    COUNT(*)                   AS total_rows,
    COUNT(DISTINCT station_id) AS unique_stations,
    SUM(weight_kg)             AS total_kg,
    ROUND(AVG(weight_kg), 2)   AS mean_kg,
    MIN(depth_m)               AS shallowest_m,
    MAX(depth_m)               AS deepest_m
FROM catches;`,
          rCode: `catches |>
  summarise(
    total_rows      = n(),
    unique_stations = n_distinct(station_id),
    total_kg        = sum(weight_kg, na.rm = TRUE),
    mean_kg         = round(mean(weight_kg, na.rm = TRUE), 2),
    shallowest_m    = min(depth_m, na.rm = TRUE),
    deepest_m       = max(depth_m, na.rm = TRUE)
  )`
        },
        {
          command: "GROUP BY & HAVING",
          tags: [],
          desc: "Bucket rows by category to calculate aggregates per group, then filter those summary groups with HAVING.",
          code: `SELECT 
    region,
    survey_year,
    COUNT(*) AS n_samples,
    SUM(weight_kg) AS total_kg
FROM catches
WHERE weight_kg > 0               -- 1. Filter raw rows first
GROUP BY region, survey_year      -- 2. Group into buckets
HAVING COUNT(*) >= 10             -- 3. Filter the grouped totals
ORDER BY survey_year DESC;`,
          rCode: `catches |>
  filter(weight_kg > 0) |>               # 1. WHERE
  summarise(                             # 2. GROUP BY + SELECT
    n_samples = n(),
    total_kg  = sum(weight_kg, na.rm = TRUE),
    .by       = c(region, survey_year)
  ) |>
  filter(n_samples >= 10) |>             # 3. HAVING
  arrange(desc(survey_year))`
        },
        {
          command: "SUM(CASE WHEN ...) Pivot",
          tags: [],
          desc: "Conditional aggregation: calculate filtered metrics or pivot rows into wide columns.",
          code: `SELECT 
    region,
    SUM(CASE WHEN season = 'Summer' THEN weight_kg ELSE 0 END) AS summer_kg,
    SUM(CASE WHEN season = 'Winter' THEN weight_kg ELSE 0 END) AS winter_kg,
    COUNT(CASE WHEN weight_kg > 100 THEN 1 END)                AS large_hauls
FROM catches
GROUP BY region;`,
          rCode: `catches |>
  summarise(
    summer_kg   = sum(weight_kg[season == "Summer"], na.rm = TRUE),
    winter_kg   = sum(weight_kg[season == "Winter"], na.rm = TRUE),
    large_hauls = sum(weight_kg > 100, na.rm = TRUE),
    .by         = region
  )
# Or use tidyr::pivot_wider(names_from = season, values_from = weight_kg)`
        },
        {
          command: "STRING_AGG / LISTAGG",
          tags: ["T-SQL", "Oracle"],
          desc: "Collapse text values across multiple rows in a group into a single comma-separated string.",
          code: `-- T-SQL / Postgres:
SELECT survey_id, STRING_AGG(species_name, ', ') WITHIN GROUP (ORDER BY species_name)
FROM survey_catches GROUP BY survey_id;

-- Oracle:
SELECT survey_id, LISTAGG(DISTINCT species_name, ', ') WITHIN GROUP (ORDER BY species_name)
FROM survey_catches GROUP BY survey_id;`,
          rCode: `survey_catches |>
  summarise(
    species_list = paste(sort(unique(species_name)), collapse = ", "),
    .by = survey_id
  )`
        }
      ]
    },
    {
      id: "sec-case-null",
      number: "5",
      title: "Conditional Logic & Handling NULLs",
      subtitle: "Add if/then/else logic inside queries and substitute safe default values when columns are NULL (NA in R).",
      items: [
        {
          command: "CASE WHEN ... THEN ... ELSE ... END",
          tags: [],
          desc: "If/else branching in SQL (equivalent to dplyr::case_when in R). Evaluates conditions top-to-bottom.",
          code: `SELECT 
    station_id,
    depth_m,
    CASE 
        WHEN depth_m IS NULL THEN 'Unknown'
        WHEN depth_m < 100   THEN 'Shallow (<100m)'
        WHEN depth_m <= 300  THEN 'Mid-Depth (100-300m)'
        ELSE 'Deep (>300m)'
    END AS depth_zone
FROM stations;`,
          rCode: `stations |>
  mutate(
    depth_zone = case_when(
      is.na(depth_m) ~ "Unknown",
      depth_m < 100  ~ "Shallow (<100m)",
      depth_m <= 300 ~ "Mid-Depth (100-300m)",
      .default       = "Deep (>300m)"
    )
  )`
        },
        {
          command: "COALESCE(val1, val2, default)",
          tags: [],
          desc: "Return the first non-NULL value in the list (identical to dplyr::coalesce in R).",
          code: `SELECT 
    sample_id,
    COALESCE(measured_weight_kg, estimated_weight_kg, 0.0) AS final_weight_kg,
    COALESCE(notes, 'No notes recorded') AS notes
FROM catches;`,
          rCode: `catches |>
  mutate(
    final_weight_kg = coalesce(measured_weight_kg, estimated_weight_kg, 0.0),
    notes           = coalesce(notes, "No notes recorded")
  )`
        },
        {
          command: "NULLIF(a, b) — Safe Division",
          tags: [],
          desc: "Returns NULL if a equals b (identical to dplyr::na_if). Turns a 0 denominator into NULL so division doesn't crash.",
          code: `SELECT 
    tow_id,
    weight_kg / NULLIF(duration_minutes, 0) AS kg_per_minute
FROM tows;`,
          rCode: `tows |>
  mutate(
    kg_per_minute = weight_kg / na_if(duration_minutes, 0)
  )`
        },
        {
          command: "ISNULL (T-SQL) & NVL (Oracle)",
          tags: ["T-SQL", "Oracle"],
          desc: "Server-specific 2-argument shortcuts for COALESCE.",
          code: `-- SQL Server (T-SQL):
SELECT ISNULL(weight_kg, 0.0) FROM dbo.catches;

-- Oracle:
SELECT NVL(weight_kg, 0.0) FROM catches;`,
          rCode: `catches |>
  mutate(weight_kg = tidyr::replace_na(weight_kg, 0.0))`
        }
      ]
    },
    {
      id: "sec-cte-window",
      number: "6",
      title: "CTEs (WITH), Subqueries & Window Functions (OVER)",
      subtitle: "Break complex queries into step-by-step blocks with WITH, and compute grouped rankings or running totals with OVER.",
      items: [
        {
          command: "WITH (Common Table Expression)",
          tags: [],
          desc: "Define named step-by-step query blocks at the top of a query—just like assigning intermediate data frames in R.",
          code: `WITH tow_totals AS (
    SELECT tow_id, survey_id, SUM(weight_kg) AS tow_kg
    FROM catches
    GROUP BY tow_id, survey_id
),
survey_averages AS (
    SELECT survey_id, AVG(tow_kg) AS avg_tow_kg
    FROM tow_totals
    GROUP BY survey_id
)
SELECT t.tow_id, t.tow_kg, s.avg_tow_kg
FROM tow_totals t
JOIN survey_averages s ON t.survey_id = s.survey_id;`,
          rCode: `tow_totals <- catches |>
  summarise(tow_kg = sum(weight_kg, na.rm = TRUE), .by = c(tow_id, survey_id))

survey_averages <- tow_totals |>
  summarise(avg_tow_kg = mean(tow_kg, na.rm = TRUE), .by = survey_id)

tow_totals |>
  inner_join(survey_averages, by = "survey_id")`
        },
        {
          command: "ROW_NUMBER, RANK & DENSE_RANK",
          tags: [],
          desc: "Rank rows within each category (PARTITION BY) without collapsing rows (like grouped mutate() in R).",
          code: `SELECT 
    region,
    species_name,
    weight_kg,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY weight_kg DESC) AS row_num,
    RANK()       OVER (PARTITION BY region ORDER BY weight_kg DESC) AS rnk,
    DENSE_RANK() OVER (PARTITION BY region ORDER BY weight_kg DESC) AS dense_rnk
FROM catches;`,
          rCode: `catches |>
  mutate(
    row_num   = row_number(desc(weight_kg)),
    rnk       = min_rank(desc(weight_kg)),
    dense_rnk = dense_rank(desc(weight_kg)),
    .by       = region
  )`
        },
        {
          command: "Top N Rows Per Group (CTE + ROW_NUMBER)",
          tags: [],
          desc: "Wrap ROW_NUMBER() in a CTE to grab the top N rows in each category (equivalent to dplyr::slice_max(..., by = ...)).",
          code: `WITH ranked AS (
    SELECT region, station_id, weight_kg,
           ROW_NUMBER() OVER (PARTITION BY region ORDER BY weight_kg DESC) AS rn
    FROM catches
)
SELECT region, station_id, weight_kg
FROM ranked
WHERE rn <= 3;`,
          rCode: `catches |>
  slice_max(order_by = weight_kg, n = 3, by = region, with_ties = FALSE)`
        },
        {
          command: "LAG & LEAD (Previous / Next Row)",
          tags: [],
          desc: "Access the previous row (LAG) or next row (LEAD) within a group to compute time-series changes.",
          code: `SELECT 
    station_id,
    survey_year,
    temp_c,
    LAG(temp_c, 1) OVER (PARTITION BY station_id ORDER BY survey_year) AS prev_temp,
    temp_c - LAG(temp_c, 1) OVER (PARTITION BY station_id ORDER BY survey_year) AS change
FROM annual_temps;`,
          rCode: `annual_temps |>
  arrange(station_id, survey_year) |>
  mutate(
    prev_temp = lag(temp_c, n = 1),
    change    = temp_c - lag(temp_c, n = 1),
    .by       = station_id
  )`
        },
        {
          command: "SUM / AVG OVER (Group Shares & Running Totals)",
          tags: [],
          desc: "Compute a group subtotal, % of group total, or cumulative running total on detail rows (grouped mutate() in R).",
          code: `SELECT 
    survey_id,
    tow_id,
    weight_kg,
    SUM(weight_kg) OVER (PARTITION BY survey_id) AS survey_total_kg,
    100.0 * weight_kg / SUM(weight_kg) OVER (PARTITION BY survey_id) AS pct_share,
    SUM(weight_kg) OVER (
        PARTITION BY survey_id ORDER BY tow_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total_kg
FROM catches;`,
          rCode: `catches |>
  arrange(survey_id, tow_id) |>
  mutate(
    survey_total_kg  = sum(weight_kg, na.rm = TRUE),
    pct_share        = 100 * weight_kg / sum(weight_kg, na.rm = TRUE),
    running_total_kg = cumsum(weight_kg),
    .by              = survey_id
  )`
        }
      ]
    },
    {
      id: "sec-functions",
      number: "7",
      title: "Everyday Text, Date & Math Functions",
      subtitle: "Clean strings, extract parts of dates, calculate date intervals, convert types, and avoid integer-division bugs.",
      items: [
        {
          command: "Text: Concatenation, TRIM, UPPER, REPLACE, SUBSTR",
          tags: [],
          desc: "Combine and clean text columns (equivalent to paste0 and stringr functions in R).",
          code: `SELECT 
    region || '-' || station_code         AS full_code, -- Or CONCAT(a, '-', b)
    UPPER(TRIM(species_name))             AS clean_name,
    REPLACE(station_code, 'OLD-', 'NEW-') AS updated_code,
    SUBSTR(station_code, 1, 3)            AS prefix_3
FROM stations;`,
          rCode: `stations |>
  mutate(
    full_code    = paste0(region, "-", station_code),
    clean_name   = stringr::str_to_upper(stringr::str_trim(species_name)),
    updated_code = stringr::str_replace_all(station_code, "OLD-", "NEW-"),
    prefix_3     = stringr::str_sub(station_code, 1, 3)
  )`
        },
        {
          command: "CAST & Integer Division Fix",
          tags: [],
          desc: "Convert data types. Remember: in SQL, integer / integer truncates decimals (3 / 4 = 0), whereas R always returns 0.75!",
          code: `SELECT 
    CAST('2024' AS INTEGER)          AS year_num,
    CAST(weight_kg AS NUMERIC(10,2)) AS exact_weight,
    (count_caught * 1.0) / total_n   AS proportion,
    ROUND(weight_kg, 1)              AS rounded_kg
FROM catches;`,
          rCode: `catches |>
  mutate(
    year_num     = as.integer("2024"),
    exact_weight = as.numeric(weight_kg),
    proportion   = count_caught / total_n,
    rounded_kg   = round(weight_kg, 1)
  )`
        },
        {
          command: "Dates: EXTRACT, DATEADD & Date Differences",
          tags: [],
          desc: "Extract year/month or compute days between dates across Standard SQL, T-SQL, and Oracle (lubridate in R).",
          code: `-- Standard / Oracle year extraction:
SELECT EXTRACT(YEAR FROM start_date) AS yr FROM surveys;

-- T-SQL (SQL Server) add 14 days & diff in days:
SELECT YEAR(start_date), DATEADD(DAY, 14, start_date), DATEDIFF(DAY, start_date, end_date)
FROM dbo.surveys;

-- Oracle add 14 days & diff in days:
SELECT start_date + INTERVAL '14' DAY, (end_date - start_date) AS days
FROM surveys;`,
          rCode: `surveys |>
  mutate(
    yr              = lubridate::year(start_date),
    two_weeks_later = start_date + lubridate::days(14),
    duration_days   = as.numeric(end_date - start_date)
  )`
        }
      ]
    },
    {
      id: "sec-write-ddl",
      number: "8",
      title: "Creating Tables & Modifying Data",
      subtitle: "Create tables, views, and indexes, and safely insert, update, or delete rows inside transactions.",
      items: [
        {
          command: "INSERT INTO",
          tags: [],
          desc: "Add new rows by listing values explicitly, or insert the results of a SELECT query.",
          code: `INSERT INTO stations (station_id, station_name, depth_m)
VALUES (101, 'North Reef', 145.0),
       (102, 'South Basin', 310.0);`,
          rCode: `# In R (in-memory tibble):
stations <- stations |>
  tibble::add_row(station_id = c(101, 102), station_name = c("North Reef", "South Basin"), depth_m = c(145, 310))
# Or push to database via DBI:
DBI::dbAppendTable(con, "stations", new_rows_df)`
        },
        {
          command: "UPDATE ... SET ... WHERE",
          tags: [],
          desc: "Update values in existing rows matching a WHERE condition.",
          code: `UPDATE catches
SET weight_kg = 88.5,
    qc_flag   = 'VERIFIED'
WHERE sample_id = 4021;`,
          rCode: `catches <- catches |>
  mutate(
    weight_kg = if_else(sample_id == 4021, 88.5, weight_kg),
    qc_flag   = if_else(sample_id == 4021, "VERIFIED", qc_flag)
  )`
        },
        {
          command: "DELETE FROM ... WHERE",
          tags: [],
          desc: "Delete rows matching a WHERE condition (note: in R filter(), you specify what to KEEP; in SQL DELETE, you specify what to REMOVE).",
          code: `DELETE FROM catches
WHERE sample_id = 4021;`,
          rCode: `# In R, keep rows where sample_id is NOT 4021:
catches <- catches |>
  filter(sample_id != 4021)`
        },
        {
          command: "BEGIN, ROLLBACK & COMMIT (Safe Updates)",
          tags: [],
          desc: "Wrap updates or deletes in a transaction so you can inspect the changes and undo mistakes with ROLLBACK before committing.",
          code: `BEGIN TRANSACTION;

UPDATE catches SET weight_kg = weight_kg * 1.10 WHERE survey_id = 5;
SELECT * FROM catches WHERE survey_id = 5; -- Verify changes

ROLLBACK; -- Undoes the update! (Use COMMIT; when ready to save)`,
          rCode: `# Run a safe transaction from R using DBI::dbWithTransaction():
DBI::dbWithTransaction(con, {
  DBI::dbExecute(con, "UPDATE catches SET weight_kg = weight_kg * 1.10 WHERE survey_id = 5")
  # Automatically rolls back if any R error or dbBreak() occurs!
})`
        }
      ]
    }
  ],

  // 3. Page 2: General SQL Overview & How to Write / Architect SQL Code
  overviewGuide: [
    {
      id: "ov-mental-model",
      number: "1",
      title: "The Mental Model: How SQL Compares to R (tidyverse)",
      summary: "If you already write R with tidyverse pipes (|> or %>%), you already know how SQL thinks! The only trick is that SQL is written 'inside-out' compared to R.",
      explanation: [
        "In **R (`tidyverse`)**, you write code in the exact order the computer runs it: start with the table (`df`), filter rows (`filter`), group (`group_by`), calculate summaries (`summarise`), sort (`arrange`), and take the top rows (`slice_head`).",
        "In **SQL**, you must write `SELECT` (the final columns you want) at the very top, even though the database actually starts at `FROM` and runs `WHERE` -> `GROUP BY` -> `HAVING` -> `SELECT` -> `ORDER BY`.",
        "**Pro Tip for Writing SQL:** Don't start typing at `SELECT`! Write your `FROM` and `JOIN` clauses first, add your `WHERE` filters second, add `GROUP BY` third, and fill in the `SELECT` columns last."
      ],
      leftLabel: "How You Write It in R (Step-by-Step Order)",
      leftCode: `# R runs top-to-bottom in natural order:
catches |>                                    # 1. Start with table
  inner_join(stations, by = "station_id") |>  # 1. Join lookup table
  filter(gear_ok == 1, weight_kg > 0) |>      # 2. Filter raw rows
  summarise(                                  # 3. Group & 5. Calculate
    n_tows   = n(),
    total_kg = sum(weight_kg, na.rm = TRUE),
    .by      = region
  ) |>
  filter(n_tows >= 5) |>                      # 4. Filter groups
  arrange(desc(total_kg)) |>                  # 6. Sort output
  slice_head(n = 10)                          # 7. Keep top 10`,
      rightLabel: "How You Write the Exact Same Logic in SQL",
      rightCode: `-- In SQL, SELECT sits on top, but runs in the same 1..7 order:
SELECT                                        -- 5. Calculate output columns
    s.region,
    COUNT(*)       AS n_tows,
    SUM(c.weight_kg) AS total_kg
FROM catches c                                -- 1. Start with table
INNER JOIN stations s                         -- 1. Join lookup table
    ON c.station_id = s.station_id
WHERE c.gear_ok = 1 AND c.weight_kg > 0       -- 2. Filter raw rows
GROUP BY s.region                             -- 3. Group by category
HAVING COUNT(*) >= 5                          -- 4. Filter groups
ORDER BY total_kg DESC                        -- 6. Sort output
FETCH FIRST 10 ROWS ONLY;                     -- 7. Keep top 10 (or LIMIT 10)`
    },
    {
      id: "ov-stringing-sql",
      number: "2",
      title: "Stringing SQL Code Together (Building Multi-Step Workflows)",
      summary: "When a question is too complex for a single flat SELECT statement, you have three ways to chain multiple steps together.",
      explanation: [
        "**Approach 1: Chained CTEs (`WITH step1 AS (...), step2 AS (...)`) — Best for 90% of Analytical Queries.** You define named step-by-step blocks at the top of a single query separated by commas. Each step can query the step above it, just like creating intermediate objects in an R script. It requires zero permissions to create tables in the database.",
        "**Approach 2: Multi-Statement Scripts with Temporary Tables (`#temp_table`) — Best for Heavy Multi-Million-Row Pipelines.** When a CTE is referenced 5 times or joins huge tables slowly, break your script into separate statements ending with semicolons (`;`). Save intermediate results into a temporary table (`SELECT ... INTO #step1`), add an index to it, and query `#step1` in the next statement.",
        "**Approach 3: Inline Subqueries — Best for Quick One-Off Filters.** Placing a short `(SELECT ...)` inside a `WHERE EXISTS (...)` or `FROM (...)` clause. Avoid nesting subqueries inside subqueries more than 1 level deep—use a `WITH` CTE instead so your code reads top-to-bottom."
      ],
      leftLabel: "Approach 1: Chaining Steps with WITH (CTEs)",
      leftCode: `-- One single query with 2 chained steps at the top:
WITH step1_valid_tows AS (
    SELECT tow_id, survey_id, station_id, swept_area_km2
    FROM tows
    WHERE gear_perf_code <= 2
),
step2_species_cpue AS (
    -- Queries step1_valid_tows just like a real table!
    SELECT 
        v.survey_id,
        v.tow_id,
        COALESCE(c.weight_kg, 0.0) / v.swept_area_km2 AS cpue
    FROM step1_valid_tows v
    LEFT JOIN catches c ON v.tow_id = c.tow_id AND c.species_id = 101
)
-- Final query pulls from step2:
SELECT survey_id, COUNT(*) AS tows, AVG(cpue) AS mean_cpue
FROM step2_species_cpue
GROUP BY survey_id;`,
      rightLabel: "Approach 2: Multi-Statement Script with #Temp Tables (T-SQL)",
      rightCode: `-- Statement 1: Materialize filtered rows into a session #temp table
DROP TABLE IF EXISTS #valid_tows;

SELECT tow_id, survey_id, station_id, swept_area_km2
INTO #valid_tows
FROM dbo.tows
WHERE gear_perf_code <= 2;

-- Statement 2: Index the temp table for fast joins
CREATE CLUSTERED INDEX ix_tmp_tow ON #valid_tows (tow_id);

-- Statement 3: Reuse #valid_tows across multiple downstream queries
SELECT v.survey_id, AVG(ISNULL(c.weight_kg, 0) / v.swept_area_km2) AS cpue
FROM #valid_tows v
LEFT JOIN dbo.catches c ON v.tow_id = c.tow_id
GROUP BY v.survey_id;`
    },
    {
      id: "ov-tables-vs-views",
      number: "3",
      title: "Tables vs. Views vs. Temp Tables vs. CTEs",
      summary: "Understanding where different database objects live, whether they store physical data, and when to choose each one.",
      comparisonTable: {
        headers: ["Object Type", "What Is It?", "Stores Data on Disk?", "How Long Does It Live?", "When Should You Use It?"],
        rows: [
          [
            "Base Table (CREATE TABLE)",
            "Actual physical rows and columns stored in the database.",
            "Yes (Permanent)",
            "Forever (until DROP TABLE)",
            "Storing raw source-of-truth records (surveys, stations, catch_samples)."
          ],
          [
            "View (CREATE VIEW)",
            "A saved SELECT query given a table-like name.",
            "No (0 bytes; runs the saved query live when you SELECT from it)",
            "Permanent definition in schema",
            "Sharing a clean, pre-joined 'virtual table' with your team so everyone uses the same QA filters and join logic."
          ],
          [
            "Materialized / Indexed View",
            "A saved query whose output rows ARE cached on disk.",
            "Yes (Refreshed on demand or schedule)",
            "Permanent until dropped",
            "Speeding up slow dashboard aggregations over millions of historical rows."
          ],
          [
            "Temporary Table (#temp / GTT)",
            "A private scratchpad table for your current connection.",
            "Yes (In tempdb / temp memory)",
            "Auto-deleted when you close your connection/session",
            "Breaking a huge multi-step script or stored procedure into fast intermediate stages."
          ],
          [
            "CTE (WITH name AS ...)",
            "A named subquery at the top of a single SELECT statement.",
            "No (Disappears the instant the query finishes)",
            "Only for that 1 query",
            "Organizing everyday analytical queries clearly without needing permission to create views or tables."
          ]
        ]
      },
      leftLabel: "Creating & Querying a View (Saved Virtual Table)",
      leftCode: `-- 1. Save complex joins & QA rules once as a View:
CREATE VIEW vw_clean_survey_catches AS
SELECT 
    sv.survey_year,
    sv.region,
    st.station_name,
    sp.common_name,
    c.weight_kg,
    c.weight_kg / t.swept_area_km2 AS cpue_kg_km2
FROM catches c
INNER JOIN tows t     ON c.tow_id = t.tow_id
INNER JOIN surveys sv ON t.survey_id = sv.survey_id
INNER JOIN stations st ON t.station_id = st.station_id
INNER JOIN species sp ON c.species_id = sp.species_id
WHERE t.gear_perf_code <= 2; -- Auto-excludes bad gear tows!`,
      rightLabel: "How Analysts Use the View Afterward",
      rightCode: `-- 2. Now anyone can query vw_clean_survey_catches just like a table
--    without having to rewrite the 5 joins or remember gear_perf_code <= 2:
SELECT 
    survey_year,
    common_name,
    ROUND(AVG(cpue_kg_km2), 2) AS mean_cpue
FROM vw_clean_survey_catches
WHERE region = 'Queen Charlotte Sound'
GROUP BY survey_year, common_name
ORDER BY survey_year DESC, mean_cpue DESC;`
    },
    {
      id: "ov-procedures-variables",
      number: "4",
      title: "Variables, Stored Procedures & Functions",
      summary: "How to parameterize SQL scripts with variables and bundle multi-step database workflows into reusable Stored Procedures.",
      explanation: [
        "**Variables (`DECLARE @var`)**: Let you define filter values once at the top of a script (like `min_year <- 2022` in R) instead of hard-coding numbers in 10 places.",
        "**Stored Procedures (`CREATE PROCEDURE`)**: Think of a Stored Procedure as a **function in R** that lives inside the database server. You pass it input parameters (like `@region = 'North', @year = 2024`), and it can run multiple steps—creating temp tables, validating data, updating records inside a transaction, and returning a final table.",
        "**View vs. Stored Procedure:** A **View** is just a single `SELECT` query that accepts *no parameters* (you filter it with `SELECT * FROM vw_name WHERE ...`). A **Stored Procedure** accepts arguments (`EXEC sp_name @yr = 2024`) and can execute multi-step logic, loops, and `INSERT`/`UPDATE` statements."
      ],
      leftLabel: "Using Variables & Creating a Stored Procedure (T-SQL)",
      leftCode: `-- 1. Using variables in an interactive T-SQL script:
DECLARE @target_year INT         = 2024;
DECLARE @target_reg  VARCHAR(50) = 'Hecate Strait';

SELECT * FROM dbo.surveys
WHERE survey_year = @target_year AND region = @target_reg;
GO

-- 2. Bundling a workflow into a Stored Procedure:
CREATE OR ALTER PROCEDURE dbo.usp_GetRegionalSpeciesSummary
    @region_name VARCHAR(50),
    @min_year    INT = 2020   -- Default parameter value
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        sv.survey_year,
        sp.common_name,
        COUNT(DISTINCT t.tow_id) AS n_tows,
        SUM(c.weight_kg)         AS total_kg
    FROM dbo.catches c
    INNER JOIN dbo.tows t     ON c.tow_id = t.tow_id
    INNER JOIN dbo.surveys sv ON t.survey_id = sv.survey_id
    INNER JOIN dbo.species sp ON c.species_id = sp.species_id
    WHERE sv.region = @region_name
      AND sv.survey_year >= @min_year
      AND t.gear_perf_code <= 2
    GROUP BY sv.survey_year, sp.common_name
    ORDER BY sv.survey_year DESC, total_kg DESC;
END;`,
      rightLabel: "Calling a Stored Procedure (In SQL & Oracle PL/SQL)",
      rightCode: `-- Calling the Stored Procedure in SQL Server (T-SQL):
EXEC dbo.usp_GetRegionalSpeciesSummary 
    @region_name = 'Hecate Strait', 
    @min_year    = 2022;


-- Equivalent Parameterized Procedure in Oracle (PL/SQL):
CREATE OR REPLACE PROCEDURE get_regional_summary (
    p_region   IN  VARCHAR2,
    p_min_year IN  NUMBER DEFAULT 2020,
    p_results  OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_results FOR
        SELECT sv.survey_year, sp.common_name, SUM(c.weight_kg) AS total_kg
        FROM catches c
        JOIN tows t     ON c.tow_id = t.tow_id
        JOIN surveys sv ON t.survey_id = sv.survey_id
        JOIN species sp ON c.species_id = sp.species_id
        WHERE sv.region = p_region AND sv.survey_year >= p_min_year
        GROUP BY sv.survey_year, sp.common_name;
END;`
    }
  ],

  // 4. Page 3: Connecting to Databases in R, Data Management Workflows & SQL Tools
  rToolsGuide: [
    {
      id: "rt-packages",
      number: "1",
      title: "The R Database Stack: Which Packages Do What?",
      summary: "In R, database access is split into a universal front-end (DBI), a driver for your specific database engine (odbc, RSQLite, duckdb), and optional query helpers (dbplyr, glue).",
      comparisonTable: {
        headers: ["R Package", "Role in Your Workflow", "When to Use It", "Key Functions"],
        rows: [
          [
            "DBI",
            "Universal Database Interface",
            "Every database script! Provides the standard verbs to connect, query, write tables, and disconnect.",
            "dbConnect(), dbGetQuery(), dbExecute(), dbWriteTable(), dbDisconnect()"
          ],
          [
            "odbc",
            "Enterprise Server Driver",
            "Connecting to corporate SQL Server (T-SQL), Oracle, or PostgreSQL databases via installed ODBC drivers.",
            "dbConnect(odbc::odbc(), Driver = ..., Server = ...)"
          ],
          [
            "RSQLite",
            "Portable Single-File DB",
            "Creating or reading self-contained .sqlite database files on your local drive or shared network folder.",
            "dbConnect(RSQLite::SQLite(), 'data/survey_db.sqlite')"
          ],
          [
            "duckdb",
            "High-Speed Local Analytical SQL",
            "Running blazing-fast analytical SQL or dplyr directly over local Parquet, CSV, or .duckdb files without loading them into RAM.",
            "dbConnect(duckdb::duckdb()), tbl(con, 'read_parquet(...)')"
          ],
          [
            "dbplyr",
            "Tidyverse-to-SQL Translator",
            "Lets you write normal dplyr pipes (filter, left_join, summarise) that R translates into SQL and runs on the server.",
            "tbl(con, 'table'), show_query(), collect(), in_schema()"
          ],
          [
            "glue",
            "Safe SQL String Interpolation",
            "Injecting R variables or vectors (like species lists or years) safely into raw SQL strings without SQL injection bugs.",
            "glue_sql('... WHERE yr = {yr} AND sp IN ({sp_vec*})', .con = con)"
          ]
        ]
      }
    },
    {
      id: "rt-connections",
      number: "2",
      title: "Connecting to SQL Server, Oracle, SQLite & DuckDB from R",
      summary: "Copy-paste templates for connecting to corporate database servers and local project databases. Never hardcode passwords in R scripts—store them in .Renviron or use Windows Trusted Authentication.",
      explanation: [
        "**SQL Server (Windows / Active Directory Auth):** When logged into your government/corporate network, set `Trusted_Connection = 'Yes'` so you don't need a username or password.",
        "**Oracle (TNS / Service Name & `.Renviron`):** Put `ORA_USER=my_username` and `ORA_PASS=my_secret` in your user `.Renviron` file (`usethis::edit_r_environ()`) and read them with `Sys.getenv('ORA_PASS')` so credentials never end up on GitHub.",
        "**Always Disconnect Cleanly:** Inside R functions or scripts, pair every `dbConnect()` with `on.exit(dbDisconnect(con), add = TRUE)`."
      ],
      leftLabel: "Connecting to SQL Server & Oracle (via odbc)",
      leftCode: `library(DBI)
library(odbc)

# See which ODBC drivers are installed on your Windows machine:
sort(unique(odbcListDrivers()$name))

# 1A. SQL Server with Windows / Network Authentication:
con_sql <- dbConnect(
  odbc::odbc(),
  Driver             = "ODBC Driver 18 for SQL Server",
  Server             = "sql-prod-server.domain.local",
  Database           = "GroundfishSurveys",
  Trusted_Connection = "Yes",
  TrustServerCertificate = "Yes"
)

# 1B. SQL Server or Oracle using a pre-configured Windows ODBC DSN:
con_dsn <- dbConnect(odbc::odbc(), dsn = "GF_Oracle_Prod",
                     UID = Sys.getenv("ORA_USER"),
                     PWD = Sys.getenv("ORA_PASS"))

# 1C. Oracle DSN-less connection (Host + Port + Service Name):
con_ora <- dbConnect(
  odbc::odbc(),
  Driver = "Oracle in OraClient19Home1",
  Dbq    = "ora-host.domain.local:1521/ORCL_SERVICE",
  UID    = Sys.getenv("ORA_USER"),
  PWD    = Sys.getenv("ORA_PASS")
)`,
      rightLabel: "Connecting to Local SQLite & DuckDB Databases",
      rightCode: `library(DBI)

# 2A. Portable SQLite Database (.sqlite file on disk):
con_sqlite <- dbConnect(
  RSQLite::SQLite(),
  dbname = "data/field_surveys_2024.sqlite"
)

# 2B. DuckDB (Fast local analytical database or in-memory engine):
con_duck <- dbConnect(
  duckdb::duckdb(),
  dbdir = "data/analytics.duckdb",
  read_only = FALSE
)

# Bonus: DuckDB can query multi-GB CSV or Parquet files directly with SQL!
df_sub <- dbGetQuery(con_duck, "
  SELECT species_code, AVG(weight_kg) AS mean_kg
  FROM read_parquet('archive/tows_2010_2024.parquet')
  WHERE survey_year >= 2020
  GROUP BY species_code
")

# Always close connections when done:
dbDisconnect(con_sqlite)
dbDisconnect(con_duck, shutdown = TRUE)`
    },
    {
      id: "rt-exploring-schemas",
      number: "3",
      title: "Exploring Unfamiliar Databases & Schemas from R",
      summary: "Before pulling millions of rows into R, inspect which schemas, tables, views, and column names exist on the server.",
      explanation: [
        "**RStudio Connections Pane:** When you connect with `odbc`, RStudio automatically opens the **Connections** tab in the top-right pane, letting you click through schemas, expand column types, and preview the first 1,000 rows of any table or view.",
        "**Schema-Qualified Tables (`in_schema` / `Id`):** Enterprise databases organize tables into schemas (like `dbo.catches` in SQL Server or `GFBIO.CATCH_SAMPLES` in Oracle). Use `DBI::Id(schema = 'GFBIO', table = 'CATCH_SAMPLES')` or `dbplyr::in_schema('GFBIO', 'CATCH_SAMPLES')`."
      ],
      leftLabel: "Listing Schemas, Tables & Columns via DBI",
      leftCode: `library(DBI)

# 1. List all tables in the default schema:
dbListTables(con)

# 2. List tables inside a specific schema (e.g., 'dbo' or 'GFBIO'):
dbListObjects(con, Id(schema = "dbo"))

# 3. List all column names of a specific table:
dbListFields(con, Id(schema = "dbo", table = "catch_samples"))

# 4. Search the server's catalog for any column matching 'species':
dbGetQuery(con, "
  SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE COLUMN_NAME LIKE '%species%'
")`,
      rightLabel: "Safe Table Previews & Lazy Exploration with dbplyr",
      rightCode: `library(dplyr)
library(dbplyr)

# 1. Point to a table or view in a specific schema (0 rows downloaded!):
catches_tbl <- tbl(con, in_schema("dbo", "catch_samples"))

# 2. Check column names & types lazily:
glimpse(catches_tbl)

# 3. Preview just the first 10 rows in R:
catches_tbl |> head(10) |> collect()

# 4. Count total rows on the server without downloading the table:
catches_tbl |> count() |> collect()`
    },
    {
      id: "rt-running-queries",
      number: "4",
      title: "Organizing SQL Files & Passing R Variables into Queries",
      summary: "For production workflows, keep your SQL code in clean .sql files and pass R filter variables (years, regions, species vectors) into them safely.",
      explanation: [
        "**Why store queries in `.sql` files?** Putting a 60-line SQL query inside an R character string loses syntax highlighting and makes debugging hard. Save your query as `sql/get_survey_cpue.sql`, test it in your SQL IDE, and load it into R with `readr::read_file()`.",
        "**Never use `paste0()` with user inputs:** Use `glue::glue_sql()` with `.con = con`. It automatically quotes strings, formats dates, and expands R vectors (`{species_vec*}`) into valid `IN ('A', 'B', 'C')` lists!"
      ],
      leftLabel: "Pattern 1: Parameterized SQL with glue_sql() & .sql Files",
      leftCode: `library(DBI)
library(glue)
library(readr)

# Define R filter parameters:
min_yr        <- 2021L
target_region <- "Queen Charlotte Sound"
target_sp     <- c(101, 103, 105)

# Build a safe query (notice {target_sp*} with an asterisk for IN lists!):
sql_query <- glue_sql("
  SELECT sv.survey_year, t.tow_id, c.species_id, c.weight_kg
  FROM dbo.catch_samples c
  INNER JOIN dbo.tow_events t ON c.tow_id = t.tow_id
  INNER JOIN dbo.surveys sv   ON t.survey_id = sv.survey_id
  WHERE sv.survey_year >= {min_yr}
    AND sv.region = {target_region}
    AND c.species_id IN ({target_sp*})
", .con = con)

# Or load a template from a .sql file and interpolate:
# raw_template <- read_file("sql/get_cpue_template.sql")
# sql_query    <- glue_sql(raw_template, .con = con)

df_catches <- dbGetQuery(con, sql_query)`,
      rightLabel: "Pattern 2: Mixing dbplyr with Raw SQL & Calling Stored Procs",
      rightCode: `library(DBI)
library(dplyr)
library(dbplyr)

# 1. Inspect the SQL generated by a dbplyr pipeline & save it:
my_pipeline <- tbl(con, "catch_samples") |>
  filter(weight_kg > 50) |>
  summarise(mean_wt = mean(weight_kg, na.rm = TRUE), .by = species_id)

# Print the SQL to console:
my_pipeline |> show_query()

# 2. Use raw SQL expressions inside dbplyr mutate/filter via sql():
tbl(con, "surveys") |>
  filter(sql("DATEDIFF(DAY, start_date, end_date) >= 14")) |>
  collect()

# 3. Call a SQL Server Stored Procedure and return results to R:
df_proc <- dbGetQuery(
  con,
  "EXEC dbo.usp_GetRegionalSpeciesSummary @region_name = 'Hecate Strait', @min_year = 2022;"
)`
    },
    {
      id: "rt-writing-managing-data",
      number: "5",
      title: "Writing Data, Staging Uploads & Safe Transactions from R",
      summary: "How to upload R data frames to database tables, append new field observations, and run safe transactional updates.",
      explanation: [
        "**`dbWriteTable()` vs. `dbAppendTable()`**: `dbWriteTable()` can create a brand-new table (or `overwrite = TRUE` an existing staging table). For adding rows to an existing production table with constraints, always use `dbAppendTable()`—it never drops the table or its indexes/permissions!",
        "**The Staging Table Pattern**: When updating thousands of rows from R, don't run 10,000 individual `UPDATE` statements in a `for` loop. Upload your R data frame once to a temporary staging table (`#r_upload_staging`), then run a single `MERGE` or joined `UPDATE` on the server."
      ],
      leftLabel: "Uploading & Appending Data Frames from R",
      leftCode: `library(DBI)

# 1. Create or overwrite a temporary/staging table from an R data frame:
dbWriteTable(
  con,
  name      = Id(schema = "dbo", table = "staging_new_stations"),
  value     = df_new_stations,
  overwrite = TRUE
)

# 2. Append rows to an existing production table (preserves keys & indexes!):
dbAppendTable(
  con,
  name  = Id(schema = "dbo", table = "catch_samples"),
  value = df_validated_catches
)

# 3. Fast bulk upload to a session #temp table in SQL Server:
dbWriteTable(con, "#tmp_updates", df_corrections, overwrite = TRUE)
dbExecute(con, "
  UPDATE c
  SET c.weight_kg = u.corrected_weight_kg
  FROM dbo.catch_samples c
  INNER JOIN #tmp_updates u ON c.sample_id = u.sample_id;
")`,
      rightLabel: "Wrapping R Database Writes in Safe Atomic Transactions",
      rightCode: `library(DBI)

# dbWithTransaction() guarantees that either ALL steps succeed,
# or every change is automatically rolled back if an error occurs!
dbWithTransaction(con, {

  # Step 1: Insert parent survey record
  dbAppendTable(con, "surveys", df_new_survey_header)

  # Step 2: Insert child tow records
  dbAppendTable(con, "tow_events", df_new_tows)

  # Step 3: Run a QA check on the server; abort & rollback if invalid!
  bad_rows <- dbGetQuery(con, "
    SELECT COUNT(*) AS n FROM tow_events WHERE swept_area_km2 <= 0
  ")$n

  if (bad_rows > 0) {
    stop("Found non-positive swept area! Rolling back entire upload.")
  }
})`
    },
    {
      id: "rt-sql-gui-tools",
      number: "6",
      title: "Recommended Tools for SQL & Database Management",
      summary: "While R is great for automated pipelines, having a dedicated SQL IDE makes exploring schemas, viewing ER diagrams, and debugging queries much faster.",
      comparisonTable: {
        headers: ["Tool / Application", "Best For", "Supported Databases", "Why It's Useful"],
        rows: [
          [
            "DBeaver (Community Edition)",
            "All-in-One Universal SQL Client",
            "SQL Server, Oracle, Postgres, SQLite, DuckDB, MySQL, Parquet",
            "Free, open-source GUI that connects to everything in one window. Auto-generates visual ER diagrams for any schema and formats messy SQL with Ctrl+Shift+F."
          ],
          [
            "SQL Server Management Studio (SSMS)",
            "SQL Server (T-SQL) Administration & Tuning",
            "Microsoft SQL Server & Azure SQL",
            "The gold standard for T-SQL: shows interactive graphical Execution Plans (Ctrl+M), missing-index suggestions, and activity monitors."
          ],
          [
            "Oracle SQL Developer (or VS Code Extension)",
            "Oracle Databases & PL/SQL Packages",
            "Oracle Database",
            "Official free Oracle client; natively understands TNSNames, PL/SQL stored procedures, and Oracle explain plans."
          ],
          [
            "RStudio / Positron / VS Code",
            "Reproducible R + SQL Research Pipelines",
            "Any ODBC / DBI connection",
            "Run live {sql connection=con, output.var='df'} code chunks directly inside Quarto (.qmd) and RMarkdown documents alongside your R plots."
          ],
          [
            "DB Browser for SQLite",
            "Viewing & Editing Local .sqlite Files",
            "SQLite (.sqlite / .db)",
            "Lightweight point-and-click desktop app for inspecting local SQLite files, editing table schemas, and importing CSVs without writing code."
          ],
          [
            "DuckDB (R package & CLI)",
            "Out-of-Memory Local Data Management",
            "DuckDB, Parquet, CSV, Arrow, SQLite",
            "Replaces bulky multi-GB CSV folders with fast compressed Parquet files that you can query in milliseconds using standard SQL or dplyr."
          ]
        ]
      }
    }
  ]
};
