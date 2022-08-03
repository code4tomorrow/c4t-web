export const notionColorMap = (color: string) => {
    switch (color) {
        case "green" : return "#25C370";
        case "yellow" : return "#DBBA2F"
        case "blue" : return "#2C50FF"
        case "red" : return "#FF877E"
        case "pink" : return "#FF69D4"
        case "orange" : return "#E18D22"
        case "purple" : return "#D73FD0"
        default: return color; 
    }
} 