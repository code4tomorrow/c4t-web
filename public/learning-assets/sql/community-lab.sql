-- SPDX-License-Identifier: MIT
-- Copyright (c) 2026 Code4Tomorrow
--
-- SQLite starter schema and seed script for a disposable practice database.
-- The synthetic values inserted below are also dedicated to CC0-1.0.

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DROP TABLE IF EXISTS readings;
DROP TABLE IF EXISTS devices;

CREATE TABLE devices (
    id INTEGER PRIMARY KEY,
    device_code TEXT NOT NULL UNIQUE,
    zone TEXT NOT NULL CHECK (zone IN ('north', 'south', 'east', 'west')),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE readings (
    id INTEGER PRIMARY KEY,
    device_id INTEGER NOT NULL,
    recorded_at TEXT NOT NULL,
    temperature_c REAL NOT NULL CHECK (temperature_c BETWEEN -20 AND 60),
    soil_moisture_pct REAL CHECK (
        soil_moisture_pct IS NULL
        OR soil_moisture_pct BETWEEN 0 AND 100
    ),
    status TEXT NOT NULL CHECK (status IN ('ok', 'watch', 'alert')),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE INDEX readings_device_time_idx
    ON readings (device_id, recorded_at);

INSERT INTO devices (id, device_code, zone, active) VALUES
    (1, 'sim-garden-01', 'north', 1),
    (2, 'sim-garden-02', 'south', 1),
    (3, 'sim-garden-03', 'west', 0);

INSERT INTO readings (
    id,
    device_id,
    recorded_at,
    temperature_c,
    soil_moisture_pct,
    status
) VALUES
    (1, 1, '2026-04-01T09:00:00Z', 20.8, 46.0, 'ok'),
    (2, 1, '2026-04-02T09:00:00Z', 21.3, 43.0, 'ok'),
    (3, 2, '2026-04-01T09:00:00Z', 22.1, 38.0, 'watch'),
    (4, 2, '2026-04-02T09:00:00Z', 23.4, 34.0, 'watch'),
    (5, 3, '2026-04-03T09:00:00Z', 24.2, 29.0, 'alert'),
    (6, 3, '2026-04-04T09:00:00Z', 25.1, NULL, 'alert');

COMMIT;

-- Practice query 1: show active devices and their latest known readings.
SELECT
    devices.device_code,
    devices.zone,
    readings.recorded_at,
    readings.temperature_c,
    readings.soil_moisture_pct,
    readings.status
FROM devices
JOIN readings ON readings.device_id = devices.id
WHERE devices.active = 1
ORDER BY readings.recorded_at DESC, devices.device_code;

-- Practice query 2: summarize temperature by zone without hiding row counts.
SELECT
    devices.zone,
    COUNT(*) AS reading_count,
    ROUND(AVG(readings.temperature_c), 1) AS average_temperature_c
FROM devices
JOIN readings ON readings.device_id = devices.id
GROUP BY devices.zone
ORDER BY devices.zone;
