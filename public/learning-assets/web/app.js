/* SPDX-License-Identifier: MIT */

"use strict";

const equipment = [
    { name: "Sensor kit", category: "electronics", status: "available" },
    { name: "USB cable", category: "accessory", status: "available" },
    { name: "Practice robot", category: "robotics", status: "checked-out" },
    { name: "Breadboard", category: "electronics", status: "maintenance" },
];

const form = document.querySelector("#filter-form");
const filter = document.querySelector("#status-filter");
const rows = document.querySelector("#equipment-rows");
const status = document.querySelector("#result-status");

function renderEquipment(selectedStatus) {
    const visibleItems = equipment.filter(
        (item) => selectedStatus === "all" || item.status === selectedStatus
    );

    rows.replaceChildren(
        ...visibleItems.map((item) => {
            const row = document.createElement("tr");
            [item.name, item.category, item.status].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            });
            return row;
        })
    );

    status.textContent = `${visibleItems.length} fictional item${
        visibleItems.length === 1 ? "" : "s"
    } shown.`;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderEquipment(filter.value);
});

renderEquipment("all");

// Extension ideas:
// 1. Add a text search without removing keyboard or screen-reader support.
// 2. Replace fixed data with the API fixture in a local development server.
// 3. Add explicit loading and error states before introducing fetch().
