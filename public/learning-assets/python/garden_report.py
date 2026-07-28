# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Code4Tomorrow
"""Summarize the bundled synthetic community-garden CSV.

This standard-library starter runs locally with Python 3. It does not send
data over a network. The blank moisture value is preserved as ``None`` rather
than silently replaced.
"""

from __future__ import annotations

import csv
from pathlib import Path
from statistics import mean


DATA_FILE = (
    Path(__file__).resolve().parents[1]
    / "datasets"
    / "community-garden-observations.csv"
)


def optional_number(raw_value: str) -> float | None:
    """Return a float for visible text and None for an empty CSV cell."""
    cleaned = raw_value.strip()
    return float(cleaned) if cleaned else None


def load_observations(path: Path) -> list[dict[str, str]]:
    """Load rows from a CSV file and fail clearly when columns are missing."""
    required_columns = {
        "observation_id",
        "plot_zone",
        "temperature_c",
        "soil_moisture_pct",
        "health_label",
    }

    with path.open(encoding="utf-8", newline="") as source:
        reader = csv.DictReader(source)
        actual_columns = set(reader.fieldnames or [])
        missing_columns = required_columns - actual_columns
        if missing_columns:
            missing = ", ".join(sorted(missing_columns))
            raise ValueError(f"Missing required CSV columns: {missing}")
        return list(reader)


def average_known_moisture(rows: list[dict[str, str]]) -> float | None:
    """Calculate a mean using known values and report no result if none exist."""
    values = [
        value
        for row in rows
        if (value := optional_number(row["soil_moisture_pct"])) is not None
    ]
    return mean(values) if values else None


def label_counts(rows: list[dict[str, str]]) -> dict[str, int]:
    """Count each synthetic health label."""
    counts: dict[str, int] = {}
    for row in rows:
        label = row["health_label"].strip() or "unlabeled"
        counts[label] = counts.get(label, 0) + 1
    return counts


def build_report(rows: list[dict[str, str]]) -> str:
    """Create a short text report that does not depend on visual charts."""
    moisture = average_known_moisture(rows)
    missing_count = sum(
        not row["soil_moisture_pct"].strip() for row in rows
    )
    counts = label_counts(rows)
    label_summary = ", ".join(
        f"{label}={count}" for label, count in sorted(counts.items())
    )
    moisture_text = (
        f"{moisture:.1f}%" if moisture is not None else "not available"
    )

    return "\n".join(
        [
            "Synthetic community-garden report",
            f"Rows loaded: {len(rows)}",
            f"Known-value average soil moisture: {moisture_text}",
            f"Rows with missing soil moisture: {missing_count}",
            f"Health labels: {label_summary}",
            "Reminder: these teaching values are synthetic, not field advice.",
        ]
    )


def main() -> None:
    """Load the bundled file and print its text summary."""
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATA_FILE}. Keep the starter folders together."
        )
    observations = load_observations(DATA_FILE)
    print(build_report(observations))


if __name__ == "__main__":
    main()


# Extension ideas:
# 1. Ask the learner for a plot zone and summarize only matching rows.
# 2. Compare deletion and imputation strategies for the blank moisture value.
# 3. Export a JSON report while preserving the original CSV unchanged.
