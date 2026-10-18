import development from "./env/development";
import production from "./env/production";

const dynamicConfig =
    process.env.NODE_ENV === "development" ? development : production;

const baseConfig = {
    meta: {
        name: "Code 4 Tomorrow",
        description:
            "Code 4 Tomorrow is entirely student-run, from the official website to merch design and finance management. C4T is a 501(c)(3) non-profit organization that offers free coding classes to students around the globe, as well as community service opportunities to our members and teachers.",
    },
    notion: {
        directoryDatabaseId: "13e7749c64aa473faea32711b39e5c9a",
        rootCoursesPageId: "785a612a6b534ec4ba34ca52905fcda9",
        alumniDirectoryDatabaseId: "169330631ee5497fbc322909c3bd7368",
    },
    sendgrid: {
        defaultTemplateId: "d-f8cf0a4781c14b1ebdda5dc69da9e1c5",
    },
    links: {
        studentRegistrationLink: "https://forms.gle/UfKof39nZiohYKtQ6",
    },
    sender: {
        groups: {
            c4tWeb: "b49Amg",
        },
        apiBaseURL: "https://api.sender.net/v2/subscribers",
    },
};

// Environment values (analytics, Cloudinary, Watson) are layered on top.
const config = { ...baseConfig, ...dynamicConfig };

export default config;
