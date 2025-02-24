"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializable = exports.get_lc_unique_name = void 0;
const map_keys_js_1 = require("./map_keys.cjs");
function shallowCopy(obj) {
    return Array.isArray(obj) ? [...obj] : { ...obj };
}
function replaceSecrets(root, secretsMap) {
    const result = shallowCopy(root);
    for (const [path, secretId] of Object.entries(secretsMap)) {
        const [last, ...partsReverse] = path.split(".").reverse();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current = result;
        for (const part of partsReverse.reverse()) {
            if (current[part] === undefined) {
                break;
            }
            current[part] = shallowCopy(current[part]);
            current = current[part];
        }
        if (current[last] !== undefined) {
            current[last] = {
                lc: 1,
                type: "secret",
                id: [secretId],
            };
        }
    }
    return result;
}
/**
 * Get a unique name for the module, rather than parent class implementations.
 * Should not be subclassed, subclass lc_name above instead.
 */
function get_lc_unique_name(
// eslint-disable-next-line @typescript-eslint/no-use-before-define
serializableClass) {
    // "super" here would refer to the parent class of Serializable,
    // when we want the parent class of the module actually calling this method.
    const parentClass = Object.getPrototypeOf(serializableClass);
    const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" &&
        (typeof parentClass.lc_name !== "function" ||
            serializableClass.lc_name() !== parentClass.lc_name());
    if (lcNameIsSubclassed) {
        return serializableClass.lc_name();
    }
    else {
        return serializableClass.name;
    }
}
exports.get_lc_unique_name = get_lc_unique_name;
class Serializable {
    /**
     * The name of the serializable. Override to provide an alias or
     * to preserve the serialized module name in minified environments.
     *
     * Implemented as a static method to support loading logic.
     */
    static lc_name() {
        return this.name;
    }
    /**
     * The final serialized identifier for the module.
     */
    get lc_id() {
        return [
            ...this.lc_namespace,
            get_lc_unique_name(this.constructor),
        ];
    }
    /**
     * A map of secrets, which will be omitted from serialization.
     * Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
     * Values are the secret ids, which will be used when deserializing.
     */
    get lc_secrets() {
        return undefined;
    }
    /**
     * A map of additional attributes to merge with constructor args.
     * Keys are the attribute names, e.g. "foo".
     * Values are the attribute values, which will be serialized.
     * These attributes need to be accepted by the constructor as arguments.
     */
    get lc_attributes() {
        return undefined;
    }
    /**
     * A map of aliases for constructor args.
     * Keys are the attribute names, e.g. "foo".
     * Values are the alias that will replace the key in serialization.
     * This is used to eg. make argument names match Python.
     */
    get lc_aliases() {
        return undefined;
    }
    /**
     * A manual list of keys that should be serialized.
     * If not overridden, all fields passed into the constructor will be serialized.
     */
    get lc_serializable_keys() {
        return undefined;
    }
    constructor(kwargs, ..._args) {
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lc_kwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (this.lc_serializable_keys !== undefined) {
            this.lc_kwargs = Object.fromEntries(Object.entries(kwargs || {}).filter(([key]) => this.lc_serializable_keys?.includes(key)));
        }
        else {
            this.lc_kwargs = kwargs ?? {};
        }
    }
    toJSON() {
        if (!this.lc_serializable) {
            return this.toJSONNotImplemented();
        }
        if (
        // eslint-disable-next-line no-instanceof/no-instanceof
        this.lc_kwargs instanceof Serializable ||
            typeof this.lc_kwargs !== "object" ||
            Array.isArray(this.lc_kwargs)) {
            // We do not support serialization of classes with arg not a POJO
            // I'm aware the check above isn't as strict as it could be
            return this.toJSONNotImplemented();
        }
        const aliases = {};
        const secrets = {};
        const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key) => {
            acc[key] = key in this ? this[key] : this.lc_kwargs[key];
            return acc;
        }, {});
        // get secrets, attributes and aliases from all superclasses
        for (
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)) {
            Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
            Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
            Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
        }
        // include all secrets used, even if not in kwargs,
        // will be replaced with sentinel value in replaceSecrets
        Object.keys(secrets).forEach((keyPath) => {
            // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-explicit-any
            let read = this;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let write = kwargs;
            const [last, ...partsReverse] = keyPath.split(".").reverse();
            for (const key of partsReverse.reverse()) {
                if (!(key in read) || read[key] === undefined)
                    return;
                if (!(key in write) || write[key] === undefined) {
                    if (typeof read[key] === "object" && read[key] != null) {
                        write[key] = {};
                    }
                    else if (Array.isArray(read[key])) {
                        write[key] = [];
                    }
                }
                read = read[key];
                write = write[key];
            }
            if (last in read && read[last] !== undefined) {
                write[last] = write[last] || read[last];
            }
        });
        return {
            lc: 1,
            type: "constructor",
            id: this.lc_id,
            kwargs: (0, map_keys_js_1.mapKeys)(Object.keys(secrets).length ? replaceSecrets(kwargs, secrets) : kwargs, map_keys_js_1.keyToJson, aliases),
        };
    }
    toJSONNotImplemented() {
        return {
            lc: 1,
            type: "not_implemented",
            id: this.lc_id,
        };
    }
}
exports.Serializable = Serializable;
