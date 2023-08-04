import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    root:{
        "div > h1": {
            fontSize:"1.875rem"
        },
        "div > h2": {
            fontSize:"1.5rem"
        },
        "div > h3": {
            fontSize:"1.25rem"
        },
        "div > p": {
            fontSize:"16px"
        },
        "div > ul": {
            listStyle: "outside",
            paddingLeft: "1.25rem"

        },
        "div > ol": {
            listStyle: "outside",
            listStyleType: "decimal",
            paddingLeft: "1.25rem"

        },
        "a":{
            color: "#5A4CAD",
            textDecoration: "underline",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            inlineSize: "auto",
            width:"40%" 
        },
        "a:hover":{
            color: "#7892EE"
        },
        "[class*='underline']":{
            textDecoration:"underline"
        },
        // has to be trikethrough because library misspelled it :/
        "[class*='trikethrough']":{
            textDecoration:"line-through"
        },
        "[class*='italic']":{
            fontStyle:"italic"
        },
        "[class*='bold']":{
            fontWeight:"bold"
        },
        // has to be trikethrough because library misspelled it :/
        "[class*='underline'][class*='trikethrough']": {
            textDecoration: "underline line-through"
        },

        "span":{
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            inlineSize: "auto",
            width:"40%"        
        },
        ".nbr-blocks":{
            width:"100%"
        }
    }
    
}));
