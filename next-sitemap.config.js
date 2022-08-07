const siteUrl = "https://www.code4tomorrow.org";

/** 
 * @type {import('next-sitemap').IConfig} 
 * */
const nextSiteMapConfig = {
    siteUrl,
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            { userAgent: "*", allow: "/" }
        ],
        additionalSitemaps: []
    },
    exclude: [],
}

module.exports = nextSiteMapConfig;