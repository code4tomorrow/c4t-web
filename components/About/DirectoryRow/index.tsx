import React from "react";
import type { IDirectoryRow as Entry } from "@utils/notion/directory";
import clsx from "clsx";

interface IDirectoryRow {
    entry: Entry
}

const DirectoryRow : React.FC<IDirectoryRow> = ({ entry }) => {
    return (
        <tr>
            <td>
                <span className="!text-medium-grey-primary !text-base">
                    { entry.name }
                </span>
            </td>
            <td>
                {
                    entry.position?.name && (
                        <span  
                            style={{ background: entry.position?.color || undefined }} 
                            className="bg-brand-green ">
                            { entry.position?.name }
                        </span>    
                    )
                }
            </td>
            <td>
                { entry.department?.map((department, idx) => 
                    <span  
                        style={{ background: department?.color || undefined }} 
                        className="bg-brand-green"
                        key={idx}>
                        { department.name }
                    </span>
                )}
            </td>
            <td>
                { entry.projects?.map((project, idx) => 
                    <span  
                        style={{ background: project?.color || undefined }} 
                        className=" bg-brand-green"
                        key={idx}>
                        { project.name }
                    </span>
                )}
            </td>
            <td>
                {
                    entry.state?.name && (
                        <span  
                            style={{ background: entry.state?.color || undefined }} 
                            className="bg-brand-green ">
                            { entry.state?.name }
                        </span>    
                    )
                }
            </td>
            <td>
                {
                    entry.country?.name && (
                        <span  
                            style={{ background: entry.country?.color || undefined }} 
                            className="bg-brand-green ">
                            { entry.country?.name }
                        </span>  
                    )
                }  
            </td>
        </tr>
    )
}

export default DirectoryRow;