import React from "react";
import Paper from "@components/Paper";
import { MailIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import { makeStyles } from "tss-react/mui";
import { IDepartmentContact } from "common/interfaces/departmentContact";

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
            "h-[100px] cursor-pointer flex-col transition-all flex justify-center items-center p-4",
            selected && classes.selected
        )}>
            <h1 className="text-brand-purple-secondary font-bold ">{ contact.name }</h1>
            <div className="flex space-x-2 items-center">
                <MailIcon className="text-medium-grey w-5" />
                <p className="text-medium-grey ">{ contact.email }</p>
            </div>
        </Paper>
    )
}

export default DepartmentContact;