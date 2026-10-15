# Executed test report — 15 October 2026

These results replace the unverified historical claims in the supplied archive. All mutation tests used the explicitly approved isolated MySQL database `studenthub_audit_test`. The application database `studenthub_db` was read only.

| Check | Result | Evidence |
|---|---|---|
| Actual MySQL connection / schema / constraints | PASS | Read-only SELECT DATABASE, VERSION, count and SHOW CREATE TABLE |
| Original backend API suite | PASS | 19/19 checks, guarded isolated target |
| New backend regressions | PASS | 14/14 unittest methods, including invalid-input subcases, duplicates, race conflict, rollback, CORS and grading boundaries |
| Existing HTTP lifecycle suite | PASS | 28/28 checks against isolated Flask at port 5011 |
| Process restart persistence | PASS | Created synthetic student, stopped/restarted Flask at 5012, retrieved same committed values, deleted own fixture |
| Frontend unit tests | PASS | 6/6: grades, safe CSV, pagination traversal, numeric roll lookup, HTTP errors, mutation lock |
| Browser lifecycle and UI | PASS | 19/19 grouped checks; Chrome, real Flask/MySQL; only error-state checks intercept API responses |
| TypeScript | PASS | npm run lint, no errors |
| Production build | PASS | npm run build |
| Clean npm install | PASS | npm ci from updated lockfile; no archived node_modules required |
| Clean Python install | PASS | requirements-lock.txt installed into temporary fresh venv; pip check reports no broken requirements |
| npm dependency advisories | PASS | npm audit: zero known advisories at check time |
| Java console demo | PASS | JDK 21 compilation and Main execution |
| Java grading/invalid marks | PASS | Nine grade/standing boundaries; four invalid-mark cases rejected |
| Existing database preservation | PASS | One student remains; zero rows updated since audit began; application schema unchanged |
| Isolated test cleanup | PASS | Zero remaining students after tests |
| Publication candidate secret scan | PASS | No local credential substring or common token/private-key patterns found in eligible source files |
| Git history from supplied ZIP | NOT TESTED | No .git history exists in the archive; there is no original history to inspect |
| Firefox/Safari and physical mobile devices | NOT TESTED | Chrome desktop and emulated 390px viewport only |
| Actual printer/PDF output | NOT TESTED | Browser print button dispatch verified; print dialog/output was not inspected |
| Production hosting / public MySQL / load tests | NOT TESTED | Outside authorized source-publication scope |

Browser checks cover dashboard metrics/empty state; all main navigation; add validation and confirmed creation; numeric ID routes; directory search plus combined filters; cancel edit; save/reload persistence; cancel deletion; actual results and CSV download; unavailable fields; print dispatch; notification/demo clarity; keyboard focus trapping and Escape; directory/results pagination and result-status filtering; mobile navigation/no horizontal document overflow; loading and database errors; failed mutations without phantom success; missing records; deletion and final state; zero uncaught page JavaScript exceptions.

Reproducible commands are in the root README. Local detailed logs, network responses, synthetic CSV exports and desktop/mobile screenshots are under ignored audit/artifacts/. They contain only synthetic test data and are deliberately excluded from public source. The standalone Java demonstration does not connect to MySQL.
