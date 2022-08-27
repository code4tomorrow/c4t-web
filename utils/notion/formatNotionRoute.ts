export const formatNotionRoute = (route: string[]) => {
    return route.map((directory, i) => {
        const trimmed = directory.trim();
        const replacePunctuation = trimmed.replaceAll(/[\!\?\:\"\']+/g, '');
        const replacedSpaces = replacePunctuation.replaceAll(/\s+/g, '-');
        const replaceSlashes = replacedSpaces.replaceAll(/\//g, '-');
        const replacedCommas = replaceSlashes.replaceAll(/\,/g, '-');
        const replaceSymbols = replacedCommas.replaceAll(/[&<>\’\“\”\+\#]/g, '-');
        const replacedMultipleDashes = replaceSymbols.replaceAll(/[-]+/g, '-');

        let result:string = replacedMultipleDashes;
        
        if (i === route.length - 1 && result.endsWith("-")) {
            result = result.slice(0, -1);
        }

        return encodeURIComponent(result);
    })
}