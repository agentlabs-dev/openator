import snakeCase from "decamelize";
import camelCase from "camelcase";
export function keyToJson(key, map) {
    return map?.[key] || snakeCase(key);
}
export function keyFromJson(key, map) {
    return map?.[key] || camelCase(key);
}
export function mapKeys(fields, mapper, map) {
    const mapped = {};
    for (const key in fields) {
        if (Object.hasOwn(fields, key)) {
            mapped[mapper(key, map)] = fields[key];
        }
    }
    return mapped;
}
