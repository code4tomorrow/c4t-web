import React, { useCallback, useMemo } from "react";
import { ClockIcon } from "@heroicons/react/outline";

interface ITimeRange {
    startDate?: string;
    endDate?: string;
}

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const TimeRange: React.FC<ITimeRange> = ({ startDate, endDate }) => {
    const getFormattedDate = useCallback((dateToFormat?: string) => {
        if (!dateToFormat) return "";
        const date = new Date(dateToFormat);
        const day = date.getDate();
        const monthIdx = date.getMonth();
        return `${MONTHS[monthIdx]} ${day}`;
    }, []);

    const startDateFormatted = useMemo(
        () => getFormattedDate(startDate),
        [startDate, getFormattedDate]
    );
    const endDateFormatted = useMemo(
        () => getFormattedDate(endDate),
        [endDate, getFormattedDate]
    );

    return (
        <div
            style={{
                lineHeight: 1,
                fontSize: "1rem",
            }}
            className="bg-[rgba(0,0,0,0.25)] pr-1 rounded-sm border border-medium-grey inline-block space-x-2"
        >
            <span className="border-0 border-r pl-1 h-full inline-block py-[2px] border-medium-grey pr-1">
                <ClockIcon className="text-medium-grey inline" width={20} />
            </span>
            <div className="inline text-medium-grey text-sm font-semibold">
                <span>{startDateFormatted}</span>
                <span className="mx-1">-</span>
                <span>{endDateFormatted}</span>
            </div>
        </div>
    );
};

export default TimeRange;
