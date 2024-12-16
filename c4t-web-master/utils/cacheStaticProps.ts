import objectHash from "object-hash";
import path from "path";
import fs from "fs/promises";
import getConfig from "next/config";
import Redis from "ioredis";

interface IParams {
    key: string;
    [key: string]: string | number | boolean;
}

const { serverRuntimeConfig } = getConfig();

const redisClient = new Redis(process.env.REDIS_URL!);

export const cache = {
    async set({
        params,
        data,
        buildCache,
        redisCache,
        ttl,
        logs = false,
    }: {
        params: IParams;
        data: any;
        buildCache?: boolean;
        redisCache?: boolean;
        ttl?: number;
        logs?: boolean;
    }) {
        const hash = objectHash(params);

        if (buildCache) {
            const buildCachePath = path.join(
                serverRuntimeConfig.PROJECT_ROOT,
                ".next/cache",
                `${hash}.json`
            );
            await fs
                .writeFile(buildCachePath, JSON.stringify(data))
                .then(() => {
                    if (logs) console.log(`saved cache @ ${buildCachePath}`);
                })
                .catch((e) => {
                    console.error("failed writing build cache file", e);
                });
        }
        if (redisCache) {
            let response;

            if (!!ttl) {
                response = redisClient.set(
                    hash,
                    JSON.stringify(data),
                    "EX",
                    ttl
                );
            } else {
                response = redisClient.set(hash, JSON.stringify(data));
            }

            response
                .then(() => {
                    if (logs) console.log(`saved redis cache @key:${hash}`);
                })
                .catch((e) => {
                    console.error("failed writing redis cache", e);
                });
        }
    },
    async getBuildCache({ params }: { params: IParams }) {
        const hash = objectHash(params);
        const buildCachePath = path.join(
            serverRuntimeConfig.PROJECT_ROOT,
            ".next/cache",
            `${hash}.json`
        );
        const data = await fs.readFile(buildCachePath).catch(() => {
            console.log(
                "No Build Cache Found for Params: ",
                params,
                `@ ${buildCachePath}`
            );
            return null;
        });
        return data ? JSON.parse(data.toString("utf-8")) : {};
    },
    async getRedisCache({
        params,
        logs = false,
    }: {
        params: any;
        logs?: boolean;
    }) {
        const hash = objectHash(params);

        const data = await redisClient
            .get(hash)
            .then((data) => {
                if (!!data) {
                    if (logs)
                        console.log(
                            "Redis Cache Found for Params: ",
                            params,
                            `@key:${hash}`
                        );
                } else throw "failed to retrieve cache";
                return data;
            })
            .catch(() => {
                if (logs)
                    console.log(
                        "No Redis Cache Found for Params: ",
                        params,
                        `@key:${hash}`
                    );
                return null;
            });
        return data ? JSON.parse(data) : {};
    },
};
