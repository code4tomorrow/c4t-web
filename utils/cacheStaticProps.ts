import objectHash from "object-hash";
import path from "path";
import fs from "fs/promises";
import getConfig from "next/config";
import Redis from "ioredis";

interface IParams {
     key: string; 
     [ key: string ]: string | number | boolean; 
}

const { serverRuntimeConfig } = getConfig()

const redisClient = new Redis(process.env.REDIS_URL!);

export const cache = {
    async set({ params, data, buildCache, redisCache }: { params: IParams, data: any, buildCache?: boolean, redisCache?: boolean }) {
          const hash = objectHash(params); 
          
          if (buildCache) {
               const buildCachePath = path.join(serverRuntimeConfig.PROJECT_ROOT, '.next/cache', `${hash}.json`);
               await fs.writeFile(buildCachePath, JSON.stringify(data))
                    .then(() => {
                         console.log(`saved cache @ ${buildCachePath}`)
                    })
                    .catch(e => {
                         console.error('failed writing build cache file', e);
                    });
          }

          if (redisCache) {
               await redisClient.set(hash, JSON.stringify(data))
                    .then(() => {  
                         console.log(`saved redis cache @key:${hash}`);
                    })
                    .catch(e => {
                         console.error('failed writing redis cache', e);
                    });
          }
     },
     async getBuildCache({ params }: { params: IParams }) {
          const hash = objectHash(params);
          const buildCachePath = path.join(serverRuntimeConfig.PROJECT_ROOT, '.next/cache', `${hash}.json`);
          const data = await fs.readFile(buildCachePath).catch(_e => {
               console.log("No Build Cache Found for Params: ", params, `@ ${buildCachePath}`);
               return null; 
          });
          return data ? JSON.parse(data.toString("utf-8")) : {}; 
     },
     async getRedisCache({ params }: { params: any }) {    
          const hash = objectHash(params);

          const data = await redisClient.get(hash)
               .then((data) => {
                    console.log("Redis Cache Found for Params: ", params, `@key:${hash}`);
                    return data; 
               })
               .catch(e => {
                    console.log(e);
                    console.log("No Redis Cache Found for Params: ", params, `@key:${hash}`);
                    return null; 
               });
          return data ? JSON.parse(data) : {}; 
     }
}