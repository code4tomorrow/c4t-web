export {};

const config = {
    ga: {
        measurementId: "G-QXB15VN08B"
    },
    contentful: {
        preview: !!process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    },
    cloudinary: {
        cloudName: "code4tomorrow",
        url: "https://res.cloudinary.com/code4tomorrow"
    },
    watsonAssistantChat: {
        integrationID: "05827545-aae9-496a-bd95-774af46cec9a",
        region: "us-south",
        serviceInstanceID: "22bae9ef-4e62-4665-aa35-18e32dc74672"
    },
    notion: {
        directoryDatabaseId: "13e7749c64aa473faea32711b39e5c9a"
    }
};

export default config; 