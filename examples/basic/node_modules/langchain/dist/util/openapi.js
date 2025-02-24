import * as yaml from "js-yaml";
export class OpenAPISpec {
    constructor(document) {
        Object.defineProperty(this, "document", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document
        });
    }
    get baseUrl() {
        return this.document.servers ? this.document.servers[0].url : undefined;
    }
    getPathsStrict() {
        if (!this.document.paths) {
            throw new Error("No paths found in spec");
        }
        return this.document.paths;
    }
    getParametersStrict() {
        if (!this.document.components?.parameters) {
            throw new Error("No parameters found in spec");
        }
        return this.document.components.parameters;
    }
    getSchemasStrict() {
        if (!this.document.components?.schemas) {
            throw new Error("No schemas found in spec.");
        }
        return this.document.components.schemas;
    }
    getRequestBodiesStrict() {
        if (!this.document.components?.requestBodies) {
            throw new Error("No request body found in spec.");
        }
        return this.document.components.requestBodies;
    }
    getPathStrict(path) {
        const pathItem = this.getPathsStrict()[path];
        if (pathItem === undefined) {
            throw new Error(`No path found for "${path}".`);
        }
        return pathItem;
    }
    getReferencedParameter(ref) {
        const refComponents = ref.$ref.split("/");
        const refName = refComponents[refComponents.length - 1];
        if (this.getParametersStrict()[refName] === undefined) {
            throw new Error(`No parameter found for "${refName}".`);
        }
        return this.getParametersStrict()[refName];
    }
    getRootReferencedParameter(ref) {
        let parameter = this.getReferencedParameter(ref);
        while (parameter.$ref !== undefined) {
            parameter = this.getReferencedParameter(parameter);
        }
        return parameter;
    }
    getReferencedSchema(ref) {
        const refComponents = ref.$ref.split("/");
        const refName = refComponents[refComponents.length - 1];
        const schema = this.getSchemasStrict()[refName];
        if (schema === undefined) {
            throw new Error(`No schema found for "${refName}".`);
        }
        return schema;
    }
    getSchema(schema) {
        if (schema.$ref !== undefined) {
            return this.getReferencedSchema(schema);
        }
        return schema;
    }
    getRootReferencedSchema(ref) {
        let schema = this.getReferencedSchema(ref);
        while (schema.$ref !== undefined) {
            schema = this.getReferencedSchema(schema);
        }
        return schema;
    }
    getReferencedRequestBody(ref) {
        const refComponents = ref.$ref.split("/");
        const refName = refComponents[refComponents.length - 1];
        const requestBodies = this.getRequestBodiesStrict();
        if (requestBodies[refName] === undefined) {
            throw new Error(`No request body found for "${refName}"`);
        }
        return requestBodies[refName];
    }
    getRootReferencedRequestBody(ref) {
        let requestBody = this.getReferencedRequestBody(ref);
        while (requestBody.$ref !== undefined) {
            requestBody = this.getReferencedRequestBody(requestBody);
        }
        return requestBody;
    }
    getMethodsForPath(path) {
        const pathItem = this.getPathStrict(path);
        // This is an enum in the underlying package.
        // Werestate here to allow "import type" above and not cause warnings in certain envs.
        const possibleMethods = [
            "get",
            "put",
            "post",
            "delete",
            "options",
            "head",
            "patch",
            "trace",
        ];
        return possibleMethods.filter((possibleMethod) => pathItem[possibleMethod] !== undefined);
    }
    getParametersForPath(path) {
        const pathItem = this.getPathStrict(path);
        if (pathItem.parameters === undefined) {
            return [];
        }
        return pathItem.parameters.map((parameter) => {
            if (parameter.$ref !== undefined) {
                return this.getRootReferencedParameter(parameter);
            }
            return parameter;
        });
    }
    getOperation(path, method) {
        const pathItem = this.getPathStrict(path);
        if (pathItem[method] === undefined) {
            throw new Error(`No ${method} method found for "path".`);
        }
        return pathItem[method];
    }
    getParametersForOperation(operation) {
        if (operation.parameters === undefined) {
            return [];
        }
        return operation.parameters.map((parameter) => {
            if (parameter.$ref !== undefined) {
                return this.getRootReferencedParameter(parameter);
            }
            return parameter;
        });
    }
    getRequestBodyForOperation(operation) {
        const { requestBody } = operation;
        if (requestBody?.$ref !== undefined) {
            return this.getRootReferencedRequestBody(requestBody);
        }
        return requestBody;
    }
    static getCleanedOperationId(operation, path, method) {
        let { operationId } = operation;
        if (operationId === undefined) {
            const updatedPath = path.replaceAll(/[^a-zA-Z0-9]/, "_");
            operationId = `${updatedPath.startsWith("/") ? updatedPath.slice(1) : updatedPath}_${method}`;
        }
        return operationId
            .replaceAll("-", "_")
            .replaceAll(".", "_")
            .replaceAll("/", "_");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static alertUnsupportedSpec(document) {
        const warningMessage = "This may result in degraded performance. Convert your OpenAPI spec to 3.1.0 for better support.";
        const swaggerVersion = document.swagger;
        const openAPIVersion = document.openapi;
        if (openAPIVersion !== undefined && openAPIVersion !== "3.1.0") {
            console.warn(`Attempting to load an OpenAPI ${openAPIVersion} spec. ${warningMessage}`);
        }
        else if (swaggerVersion !== undefined) {
            console.warn(`Attempting to load a Swagger ${swaggerVersion} spec. ${warningMessage}`);
        }
        else {
            throw new Error(`Attempting to load an unsupported spec:\n\n${JSON.stringify(document, null, 2)}.`);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromObject(document) {
        OpenAPISpec.alertUnsupportedSpec(document);
        return new OpenAPISpec(document);
    }
    static fromString(rawString) {
        let document;
        try {
            document = JSON.parse(rawString);
        }
        catch (e) {
            document = yaml.load(rawString);
        }
        return OpenAPISpec.fromObject(document);
    }
    static async fromURL(url) {
        const response = await fetch(url);
        const rawDocument = await response.text();
        return OpenAPISpec.fromString(rawDocument);
    }
}
