export const formatNotionRoute = (route: string[]) => {
    return route.map((directory) => {
        const trimmed = directory.trim();
        const replacePunctuation = trimmed.replaceAll(/[\!\?]+/g, '');
        const replacedSpaces = replacePunctuation.replaceAll(/\s+/g, '-');
        const replacedCommas = replacedSpaces.replaceAll(/\,/g, '-');
        const replacedMultipleDashes = replacedCommas.replaceAll(/[-]+/g, '-');
        return encodeURIComponent(replacedMultipleDashes);
    })
}