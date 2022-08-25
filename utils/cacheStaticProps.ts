import objectHash from "object-hash";
import path from "path";
import fs from "fs/promises";

export const cache = {
    async set({ params, data }: { params: any, data: any}) {
        const hash = objectHash(params); 
        const cachePath = path.join(__dirname, `${hash}.json`);
        await fs.writeFile(cachePath, JSON.stringify(data)).catch(e => {
          console.error('writing cache file', e);
        } );
   },
   async get({ params }: { params: any }) {
        const hash = objectHash(params);
        const cachePath = path.join(__dirname, `${hash}.json`);
        const data = await fs.readFile(cachePath);
        return JSON.parse(data.toString("utf-8")); 
   }
}