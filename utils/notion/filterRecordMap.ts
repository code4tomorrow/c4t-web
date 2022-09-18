import { ExtendedRecordMap } from 'notion-types'

export const filterRecordMap = (recordMap: ExtendedRecordMap) => {
    const filterRecordMap = recordMap; 

    Object.entries(recordMap.block).forEach(([ id, { value }]) => {
        if (!!value) {
            delete (value as any)['created_by_id'];
            delete (value as any)['last_edited_by_id'];
            delete (value as any)['last_edited_time'];
            delete (value as any)['space_id'];
            delete (value as any)['version'];
        }
         
        filterRecordMap.block[id].value = value || null;
    });

    return filterRecordMap;
}