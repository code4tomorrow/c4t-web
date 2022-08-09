import Paper from "@components/Paper";
import { IDirectoryRow } from "@utils/notion/directory";
import clsx from "clsx";
import React from "react";
import { useStyles } from "./styles";
import { FixedSizeList as VirtualList } from "react-window";
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
            accessor: (e) => <div className="text-medium-grey"><span>{ e.name }</span></div>,
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
              {row.cells.map((cell, idx) => {
                return (
                  <div 
                    {...cell.getCellProps()} 
                    key={idx}
                    className={clsx(
                        "[&>div>span[data-tag]]:bg-brand-purple-secondary px-5",
                        classes.cell
                    )}>
                    {cell.render('Cell')}
                  </div>
                )
              })}
            </div>
          )
        },
        [prepareRow, rows, classes.cell ]
      )

    return (
        <Paper 
            containerClass={clsx(
              "w-full !p-0 max-w-7xl flex !overflow-x-auto",
              classes.container
            )}>
            <div {...getTableProps()} 
                className={clsx("p-3 w-full pt-0 inline-block relative", classes.table)}>
                <div className={clsx("absolute bg-dark-grey-secondary z-10 md:px-9", classes.thead)}>
                    {headerGroups.map((headerGroup, idx) => (
                    <div {...headerGroup.getHeaderGroupProps()} key={idx}>
                        {headerGroup.headers.map((column, idx) => (
                        <div  {...column.getHeaderProps()} key={idx} className="text-white font-bold px-5 py-6">
                            {column.render('Header')}
                        </div>
                        ))}
                    </div>
                    ))}
                </div>
                <div {...getTableBodyProps()} 
                    className="w-full md:px-9">
                    <VirtualList
                        // onItemsRendered={handleNewItemsRendered}
                        height={Math.min(780, 40 * rows.length)}
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
    )
}

export default Directory; 