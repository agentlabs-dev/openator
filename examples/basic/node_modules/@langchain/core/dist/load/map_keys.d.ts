export interface SerializedFields {
    [key: string]: any;
}
export interface SerializedKeyAlias {
    [key: string]: string;
}
export declare function keyToJson(key: string, map?: SerializedKeyAlias): string;
export declare function keyFromJson(key: string, map?: SerializedKeyAlias): string;
export declare function mapKeys(fields: SerializedFields, mapper: typeof keyToJson, map?: SerializedKeyAlias): SerializedFields;
