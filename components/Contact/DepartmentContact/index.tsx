import React from "react";
import Paper from "@components/Paper";
import clsx from "clsx";
import { makeStyles } from "tss-react/mui";
import { IDepartmentContact } from "common/interfaces/departmentContact";
import Copy from "@components/Copy";

interface DepartmentContactProps {
    selected?: boolean;
    contact: IDepartmentContact,
    onClick: (id:string) => void; 
}

const DepartmentContact : React.FC<DepartmentContactProps> = ({ selected = false, onClick, contact }) => {
    const { classes } = makeStyles()(() => ({
        selected: {
            boxShadow: `0px 0px 0px 2px #7892EE !important`
        }
    }))();

    const handleClick = () => onClick(contact.sys.id);

    return (
        <Paper 
            onClick={handleClick}
            containerClass={clsx(
            "min-h-[100px] cursor-pointer flex-col transition-all flex justify-center items-center p-4",
            selected && classes.selected
        )}>
            <h1 className="text-brand-purple-secondary font-bold ">{ contact.name }</h1>
            <div className="flex space-x-2 items-center">
                {/* <MailIcon className="text-medium-grey w-5" /> */}
                <p className="text-medium-grey whitespace-nowrap font-medium">{ contact.email }</p>
                <Copy content={contact.email} snackLabel={`Copied C4T ${ contact.name } Email`} />
            </div>
           { contact.description && (
             <p className="text-medium-grey text-center mt-1">{ contact.description }</p>
           )}
        </Paper>
    )
}

export default DepartmentContact;