/**
 * Copies a gsap vars object so gsap can mutate its copy freely. Plain objects
 * and arrays are copied recursively; functions (callbacks) and other values
 * are kept by reference. Replaces lodash/cloneDeep, which pulled ~100 lodash
 * modules into every page that animates.
 */
export const cloneVars = <T>(value: T): T => {
    if (Array.isArray(value)) return value.map(cloneVars) as unknown as T;
    if (value && typeof value === "object") {
        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null) return value;
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, cloneVars(item)])
        ) as T;
    }
    return value;
};
