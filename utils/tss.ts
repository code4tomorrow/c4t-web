import { createMakeAndWithStyles } from "tss-react";

/**
 * tss-react without Material UI.
 *
 * `tss-react/mui` exists to hand MUI's theme to each style function, and in
 * doing so pulls all of @mui/material/styles into every page's bundle. No
 * style on this site reads a theme, so an empty one gives the same CSS without
 * shipping MUI to the browser.
 */
export const { makeStyles, withStyles } = createMakeAndWithStyles({
    useTheme: () => ({}),
});
