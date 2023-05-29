export const validateUUID = (value: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export const addDashesToUUID = (i: string): string => {
    return i.substring(0,8)+"-"+i.substring(8, 12)+"-"+i.substring(12, 16)+"-"+i.substring(16, 20)+"-"+i.substring(20);
}