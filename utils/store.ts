import { useSyncExternalStore } from "react";

/**
 * A minimal shared-state store for the few app-wide values the site keeps
 * (modal open, toast queue, "already saw this sign-up modal").
 *
 * This replaces Recoil, which added ~30 KB of JavaScript to every page for
 * those three values. State only changes in effects and event handlers, and
 * the server always renders an atom's default, so there is nothing to leak
 * between server requests.
 */
export interface Atom<T> {
    readonly key: string;
    readonly defaultValue: T;
    get: () => T;
    set: (next: T | ((previous: T) => T)) => void;
    subscribe: (listener: () => void) => () => void;
}

export function createAtom<T>({
    key,
    default: defaultValue,
}: {
    key: string;
    default: T;
}): Atom<T> {
    let value = defaultValue;
    const listeners = new Set<() => void>();
    return {
        key,
        defaultValue,
        get: () => value,
        set: (next) => {
            const resolved =
                typeof next === "function"
                    ? (next as (previous: T) => T)(value)
                    : next;
            if (Object.is(resolved, value)) return;
            value = resolved;
            listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}

export const useAtomValue = <T>(atom: Atom<T>): T =>
    useSyncExternalStore(atom.subscribe, atom.get, () => atom.defaultValue);

export const useSetAtom = <T>(atom: Atom<T>) => atom.set;

export const useAtom = <T>(atom: Atom<T>) =>
    [useAtomValue(atom), atom.set] as const;
