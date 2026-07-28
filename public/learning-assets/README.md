# C4T free learning starter assets

This directory contains small, original starter files for Code4Tomorrow course
activities. All records describe fictional devices, plots, and events. They
contain no personal data, credentials, API keys, or real-world measurements.

These are static downloads and reference inputs. The website does not execute
the Python, JavaScript, SQL, machine-learning, hardware, or agent files merely
by serving them. Run code only in a suitable local learning environment or a
course tool that explicitly supports that file type.

## Licenses

-   CSV and JSON datasets and fixtures are dedicated to the public domain under
    **CC0 1.0 Universal**. See `LICENSE-DATA-CC0.txt`.
-   Python, HTML, CSS, JavaScript, and SQL starter code is available under the
    **MIT License**. See `LICENSE-CODE-MIT.txt`.

The license field inside each JSON fixture is metadata for the file itself.
Names of software or standards mentioned in an exercise remain the property of
their respective owners.

## Asset guide

| Asset                                            | What it contains                                                                                      | Course support         |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| `datasets/community-garden-observations.csv`     | Twelve synthetic garden observations, including one intentionally missing value for cleaning practice | 3–4, 13, 16, 19, 22–23 |
| `api/community-lab-api.json`                     | Fixed example HTTP requests and responses; it is not a live endpoint                                  | 4, 7, 11, 17, 21, 23   |
| `sql/community-lab.sql`                          | SQLite-compatible schema, seed rows, constraints, and example queries                                 | 11, 13, 17, 22–23      |
| `python/garden_report.py`                        | Runnable standard-library CSV summary starter with extension ideas                                    | 3–4                    |
| `web/index.html`, `web/styles.css`, `web/app.js` | Accessible, responsive browser starter using fixed local data                                         | 6–7                    |
| `ml/evaluation-fixture.json`                     | Fixed classification, retrieval, research, and deployment evaluation values                           | 13–16, 18–23           |
| `hardware/sensor-trace.csv`                      | Synthetic microcontroller, robot, IoT, and edge-inference readings                                    | 9–10, 17–18            |
| `agents/evaluation-task.json`                    | A bounded fictional repository-edit task and deterministic checks                                     | 24–25                  |
| `agents/evaluation-trace.json`                   | A recorded, simulated multi-agent trace with a blocked unsafe action                                  | 24–25                  |

## Suggested use

1. Download or copy only the files needed for the activity.
2. Keep an unchanged copy so the exercise can be reset.
3. Read the file description and column notes below before interpreting values.
4. Treat every model, hardware, API, and agent result as a teaching fixture,
   not evidence about a real system.
5. Never paste credentials or private documents into an exercise.

### Garden observation columns

-   `observation_id`: stable fictional row identifier.
-   `day`: synthetic observation date.
-   `plot_zone` and `plant_type`: categorical features.
-   `temperature_c`, `soil_moisture_pct`, `light_lux`,
    `water_added_l`, and `plant_height_cm`: numeric teaching features.
-   `health_label`: synthetic label with values `healthy`, `watch`, or `stressed`.

Row `obs-008` intentionally has a blank `soil_moisture_pct` value. Learners
should decide whether to preserve, remove, or impute it and document that
choice.

### Hardware trace columns

Each row is a simulated snapshot of the same fictional low-voltage learning
device. Motion, direction, temperature, moisture, distance, motor commands,
radio data, and edge-model output can be charted or replayed. The values are
not electrical ratings, wiring guidance, or measurements from a physical
board.

### Local checks

These commands are optional examples, not actions performed by the website:

```sh
python3 -m py_compile public/learning-assets/python/garden_report.py
python3 public/learning-assets/python/garden_report.py
sqlite3 /tmp/c4t-community-lab.db < public/learning-assets/sql/community-lab.sql
node --check public/learning-assets/web/app.js
```

JSON files can be checked with `python3 -m json.tool FILE`. The SQLite script
resets only its own `readings` and `devices` tables, so use it with a new
practice database rather than an existing database.
