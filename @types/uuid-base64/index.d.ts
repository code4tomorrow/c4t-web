declare module "uuid-base64" {
    export const encode: (uncompressedUUID: string) => string;
    export const decode: (compressedUUID: string) => string;
}
