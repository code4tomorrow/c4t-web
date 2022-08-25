import objectHash from "object-hash";
import path from "path";
import fs from "fs/promises";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig()

export const cache = {
    async set({ params, data, buildCache = false, staticPropsCache = false }: { params: any, data: any, buildCache?: boolean, staticPropsCache?: boolean }) {
        const hash = objectHash(params); 
        if (buildCache) {
          const buildCachePath = path.join(serverRuntimeConfig.PROJECT_ROOT, '.next/cache', `${hash}.json`);
          await fs.writeFile(buildCachePath, JSON.stringify(data)).catch(e => {
               console.error('failed writing build cache file', e);
          });
        } 
        if (staticPropsCache) {
          const staticPropsCachePath = path.join(__dirname, `${hash}.json`);
          await fs.writeFile(staticPropsCachePath, JSON.stringify(data)).catch(e => {
               console.error('failed writing static props cache file', e);
          });
        }
     },
     async getBuildCache({ params }: { params: any }) {
          const hash = objectHash(params);
          const buildCachePath = path.join(serverRuntimeConfig.PROJECT_ROOT, '.next/cache', `${hash}.json`);
          const data = await fs.readFile(buildCachePath).catch(_e => {
               console.log("No Cache Found for Params: ", params);
               return null; 
          });
          return data ? JSON.parse(data.toString("utf-8")) : {}; 
     },
     async getStaticPropsCache({ params }: { params: any }) {
          const hash = objectHash(params);
          const staticPropsCachePath = path.join(__dirname, `${hash}.json`);
          const data = await fs.readFile(staticPropsCachePath).catch(_e => {
                    console.log("No Cache Found for Params: ", params);
                    return null; 
          });
          return data ? JSON.parse(data.toString("utf-8")) : {}; 
     }
}