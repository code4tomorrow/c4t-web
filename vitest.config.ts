import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
    resolve: {
        alias: {
            lib: path.resolve(__dirname, "lib"),
            learning: path.resolve(__dirname, "learning"),
            "@utils": path.resolve(__dirname, "utils"),
            "@components": path.resolve(__dirname, "components"),
        },
    },
});
