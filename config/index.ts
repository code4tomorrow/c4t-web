import development from "./env/development";
import production from "./env/production";
import extend from "lodash/extend";

const dynamicConfig = process.env.NODE_ENV === "development" ? development : production; 

const config = extend({
    name: "C4T Website",
    notion: {
        directoryDatabaseId: "13e7749c64aa473faea32711b39e5c9a",
        rootCoursesPageId: "785a612a6b534ec4ba34ca52905fcda9",
    }
}, dynamicConfig );

export default config; 