# Screenshot checklist

Use synthetic data in the approved isolated database. Never publish real student profiles or credentials in screenshots.

Capture dashboard, directory (empty/populated/search/filter/pagination), add (validation/success), details, edit (save/cancel), results (grades/filter/CSV), delete confirmation (cancel/confirm), error/loading states and mobile navigation. Hash URLs use `/#/dashboard`, `/#/students`, `/#/add-student`, `/#/students/{id}`, `/#/students/{id}/edit` and `/#/results`.

The automated browser runner saves desktop/mobile screenshots under ignored `audit/artifacts/`. These are local audit evidence, not source assets. See the final audit for checks actually executed.
