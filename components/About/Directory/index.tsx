import Paper from "@components/Paper";
import { IDirectoryRow } from "@utils/notion/directory";
import clsx from "clsx";
import React, { useMemo } from "react";
import DirectoryRow from "../DirectoryRow";
import { useStyles } from "./styles";

interface IDirectoryProps {
    directoryEntries: IDirectoryRow[]
}

const Directory : React.FC<IDirectoryProps> = ({ directoryEntries }) => {
    const { classes } = useStyles()

    const slicedDirectory = useMemo(() => {
        return directoryEntries;
    }, [ directoryEntries ])

    return (
        <Paper containerClass="w-full pt-0 p-3 max-w-7xl max-h-[750px] !overflow-auto">
            <table className="w-full">
                <thead className={clsx(
                    "sticky top-0 bg-dark-grey-secondary bg-opacity-75 text-white text-left",
                    classes.thead
                )}>
                    <tr className="[&>th]:py-4 [&>th]:px-4">
                        <th>Name</th>
                        <th>Position</th>
                        <th>Department</th>
                        <th>Projects</th>
                        <th>State/Province</th>
                        <th>Country</th>
                    </tr>
                </thead>
                <tbody className={clsx(
                    "[&>tr>td>*]:whitespace-nowrap [&>tr>td>span]:text-white [&>tr>td]:py-2 [&>tr>td]:px-4",
                    "[&>tr>td>span]:text-sm [&>tr>td>span]:rounded [&>tr>td>span]:p-1",
                    "[&>tr>td]:space-x-3 [&>tr>td]:overflow-auto [&>tr>td]:max-w-[125px]"
                )}>
                    {
                        slicedDirectory.map((entry, id) => {
                            return <DirectoryRow key={id} entry={entry} />; 
                        })
                    }
                </tbody>
            </table>
        </Paper>
    )
}

export default Directory; 