import objectHash from "object-hash";
import path from "path";
import fs from "fs/promises";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig()

export const cache = {
    async set({ params, data }: { params: any, data: any}) {
        const hash = objectHash(params); 
        const cachePath = path.join(serverRuntimeConfig.PROJECT_ROOT, '.next/cache', `${hash}.json`);
        await fs.writeFile(cachePath, JSON.stringify(data)).catch(e => {
          console.error('writing cache file', e);
        } );
   },
   async get({ params }: { params: any }) {
        const hash = objectHash(params);
        const cachePath = path.join(serverRuntimeConfig.PROJECT_ROOT, '.next/cache', `${hash}.json`);
        const data = await fs.readFile(cachePath).catch(_e => {
               console.log("Not Cache Found for Params: ", params);
               return null; 
        });
        return data ? JSON.parse(data.toString("utf-8")) : null; 
   }
}