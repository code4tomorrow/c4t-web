import Paper from "@components/Paper";
import { IAlumniDirectoryRow } from "@utils/notion/alumniDirectory";
import clsx from "clsx";
import React, {useMemo, useState } from "react";
import { useStyles } from "../Directory/styles";
import { FixedSizeList as VirtualList } from "react-window";
import { useTable, useBlockLayout, Column } from "react-table";
import AlumniInformation from "./AlumniInformation";
import useDimensions from "hooks/useDimensions";

interface IAlumniDirectoryProps {
    directoryEntries: IAlumniDirectoryRow[];
}

const Directory: React.FC<IAlumniDirectoryProps> = ({ directoryEntries }) => {
    const { classes } = useStyles();

    const { width } = useDimensions({ enableDebounce: true });
    const isMobile = useMemo(() => width < 768, [width]);
    
    const [ displayAlumni, setDisplayAlumni ] = useState<IAlumniDirectoryRow>();
    const [clickedPosition, setClickedPosition] = useState<{ top: number; left: number }>();


    const updateAlumniShow = (props:IAlumniDirectoryRow, event: React.MouseEvent) => {
        setDisplayAlumni(props)

        const elementClicked = event.currentTarget as HTMLElement

        const top = elementClicked.getBoundingClientRect().top - (document.getElementById("alumniContainer")?.getBoundingClientRect().top ?? 0);
        const left = elementClicked.getBoundingClientRect().left - (document.getElementById("alumniContainer")?.getBoundingClientRect().left ?? 0);;

        setClickedPosition({top, left});
    }

    const clearAlumniDisplay = () => {
        setDisplayAlumni(undefined)
    }


    const columns: Column<IAlumniDirectoryRow>[] = React.useMemo(
        () =>
            [
                {
                    Header: "Name",
                    accessor: (e) => (
                        <div className="text-medium-grey">
                            {
                                (e.page_children !== null && JSON.stringify(e.page_children?.results) != "[]") ? 
                                <span className="cursor-pointer underline hover:text-brand-purple-secondary" onClick={
                                    (event) => updateAlumniShow(e, event)}>
                                {e.name}</span> :
                                <span>{e.name}</span>
                            }
                            
                        </div>
                    ),
                },
                {
                    Header: "C4T Graduation Year",
                    accessor: (e) => (
                        <div className="text-medium-grey">
                            <span>{e.graduation_year}</span>
                        </div>
                    ),
                },
                {
                    Header: "Former Position",
                    accessor: (e) => (
                        <div>
                            <span
                                style={{
                                    background: e.former_position?.color || undefined,
                                }}
                                data-tag
                            >
                                {e?.former_position?.name}
                            </span>
                        </div>
                    ),
                },
                {
                    Header: "Former Projects",
                    accessor: (e) => (
                        <div>
                            {e?.former_projects?.map((d, idx) => (
                                <span
                                    key={idx}
                                    data-tag
                                    style={{ background: d.color || undefined }}
                                >
                                    {d.name}
                                </span>
                            ))}
                        </div>
                    ),
                },
                
                {
                    Header: "College",
                    accessor: (e) => (
                        <div>
                            <span
                                style={{
                                    background: e.college?.color || undefined,
                                }}
                                data-tag
                            >
                                {e?.college?.name}
                            </span>
                        </div>
                    ),
                },
                {
                    Header: "Country",
                    accessor: (e) => (
                        <div>
                            <span
                                style={{
                                    background: e.country?.color || undefined,
                                }}
                                data-tag
                            >
                                {e?.country?.name}
                            </span>
                        </div>
                    ),
                },
                
            ] as Column<IAlumniDirectoryRow>[],
        []
    );


    const defaultColumn = React.useMemo(
        () => ({
            width: 200,
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        totalColumnsWidth,
        prepareRow,
    } = useTable(
        {
            columns,
            data: directoryEntries,
            defaultColumn,
        },
        useBlockLayout
    );

    const RenderVirtualRow = React.useCallback(
        ({ index, style }: { index: number; style: any }) => {
            const row = rows[index];
            prepareRow(row);
            return (
                <div
                    {...row.getRowProps({
                        style: { ...style, top: style.top + 80 },
                    })}
                >
                    {row.cells.map((cell, idx) => {
                        return (
                            <div
                                {...cell.getCellProps()}
                                key={idx}
                                className={clsx(
                                    "[&>div>span[data-tag]]:bg-brand-purple-secondary px-5",
                                    classes.cell
                                )}
                            >
                                {cell.render("Cell")}
                            </div>
                        );
                    })}
                </div>
            );
        },
        [prepareRow, rows, classes.cell]
    );


    return (
        
        
        <Paper
            containerClass={clsx(
                "w-full !p-0 max-w-7xl flex !overflow-x-auto",
                classes.container
            )}
            id={"alumniContainer"}
        >
            <div className="flex w-[300px] sm:w-[500px] absolute z-50" 
            style={{
                marginTop: (clickedPosition?.top ?? 0) - 30,
                marginLeft: (!isMobile) ? (clickedPosition?.left ?? 0) + 175 : 0,
            }}
        >
                <AlumniInformation key={clickedPosition?.top} alumniInfo={displayAlumni} onExit={() => clearAlumniDisplay()}/>
        </div>
            
            <div
                {...getTableProps()}
                className={clsx(
                    "p-3 w-full pt-0 inline-block relative",
                    classes.table
                )}
            >
                <div
                    className={clsx(
                        "absolute bg-dark-grey-secondary z-10 md:px-9",
                        classes.thead
                    )}
                >
                    {headerGroups.map((headerGroup, idx) => (
                        <div {...headerGroup.getHeaderGroupProps()} key={idx}>
                            {headerGroup.headers.map((column, idx) => (
                                <div
                                    {...column.getHeaderProps()}
                                    key={idx}
                                    className="text-white font-bold px-5 py-6"
                                >
                                    {column.render("Header")}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div {...getTableBodyProps()} className="w-full md:px-9">
                    <VirtualList
                        // onItemsRendered={handleNewItemsRendered}
                        height={Math.min(780, 40 * rows.length + 80)}
                        className="w-full"
                        itemCount={rows.length}
                        itemSize={40}
                        width={totalColumnsWidth + 15}
                    >
                        {RenderVirtualRow}
                    </VirtualList>
                </div>
                
                
            </div>
        </Paper>
        
    );
};

export default Directory;
