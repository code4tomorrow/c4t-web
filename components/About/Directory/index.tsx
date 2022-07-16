import Paper from "@components/Paper";
import { IDirectoryRow } from "@utils/notion/directory";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { useStyles } from "./styles";
import { FixedSizeList as VirtualList, ListOnItemsRenderedProps } from "react-window";
import { useTable, useBlockLayout, Column } from 'react-table';

interface IDirectoryProps {
    directoryEntries: IDirectoryRow[]
}

const Directory : React.FC<IDirectoryProps> = ({ directoryEntries }) => {
    const { classes } = useStyles()

    const columns: Column<IDirectoryRow>[] = React.useMemo(
        () => [
          {
            Header: 'Name',
            accessor: (e) => <div className="text-medium-grey-primary"><span>{ e.name }</span></div>,
          },
          {
            Header: "Position",
            accessor: (e) => (
                <div>
                    <span 
                        style={{ background: e.position?.color || undefined }} 
                        data-tag>
                            { e?.position?.name }
                    </span>
                </div>
            )
          },
          {
            Header: "Department",
            accessor: (e) => (
                <div>{ e?.department?.map((d, idx) => (
                    <span
                        key={idx}
                        data-tag
                        style={{ background: d.color || undefined }} 
                        >
                            {d.name}
                    </span>
                )) }</div>
            )
          },
          {
            Header: "Projects",
            accessor: (e) => (
                <div>{ e?.projects?.map((d, idx) => (
                    <span
                        key={idx}
                        data-tag
                        style={{ background: d.color || undefined }} 
                        >
                            {d.name}
                    </span>
                )) }</div>
            )
          },
          {
            Header: "State/Province",
            accessor: (e) => (
                <div>
                    <span 
                        style={{ background: e.state?.color || undefined }} 
                        data-tag>
                            { e?.state?.name }
                    </span>
                </div>
            )
          },
          {
            Header: "Country",
            accessor: (e) => (
                <div>
                    <span 
                        style={{ background: e.country?.color || undefined }} 
                        data-tag>
                            { e?.country?.name }
                    </span>
                </div>)
          },
        ] as Column<IDirectoryRow>[],
        []
    )
    

    const defaultColumn = React.useMemo(
        () => ({
          width: 200,
        }),
        []
    )

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
    )

    const RenderVirtualRow = React.useCallback(
        ({ index, style } : { index: number, style: any }) => {
          const row = rows[index]
          prepareRow(row)
          return (
            <div
              {...row.getRowProps({
                style: { ...style, top: style.top + 80 },
              })}
            >
              {row.cells.map(cell => {
                return (
                  <div 
                    {...cell.getCellProps()} 
                    className={clsx(
                        "[&>div>span[data-tag]]:bg-brand-green px-5",
                        classes.cell
                    )}>
                    {cell.render('Cell')}
                  </div>
                )
              })}
            </div>
          )
        },
        [prepareRow, rows]
      )

    // const [ reachedEnd, setReachedEnd ] = useState(false);

    // const handleNewItemsRendered = (e:ListOnItemsRenderedProps) => {
    //     if (e.overscanStopIndex === directoryEntries.length - 1) setReachedEnd(true);
    //     else setReachedEnd(false);
    // };

    return (
        <Paper 
            containerClass="w-full !p-0 max-w-7xl flex !overflow-x-auto">
            <div {...getTableProps()} 
                className="p-3 w-full pt-0 inline-block relative">
                <div className={clsx("absolute bg-dark-grey-secondary bg-opacity-75 z-10 px-9", classes.thead)}>
                    {headerGroups.map(headerGroup => (
                    <div {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                        <div {...column.getHeaderProps()} className="text-white font-bold px-5 py-6">
                            {column.render('Header')}
                        </div>
                        ))}
                    </div>
                    ))}
                </div>
                <div {...getTableBodyProps()} 
                    className="w-full px-9">
                    <VirtualList
                        // onItemsRendered={handleNewItemsRendered}
                        height={Math.min(780, 40 * rows.length)}
                        className="w-full"
                        itemCount={rows.length}
                        itemSize={40}
                        width={totalColumnsWidth}
                        >
                        {RenderVirtualRow}
                    </VirtualList>
                </div>
            </div>
        </Paper>
    )
}

export default Directory; 