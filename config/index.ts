import development from "./env/development";
import production from "./env/production";
import _ from "lodash";

const dynamicConfig = process.env.NODE_ENV === "development" ? development : production; 

const config = _.extend({
    name: "C4T Website",
}, dynamicConfig );

export default config; 