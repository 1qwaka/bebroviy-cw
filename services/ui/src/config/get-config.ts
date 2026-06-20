import { Config } from "./config";

export function getConfig(): Config {
    if (typeof window !== 'undefined' && window.__config__) {
        return window.__config__;
    }

    console.error('Config not provided!')

    return {
        idpUrl: 'http://localhost:3013',
        apiUrl: 'http://localhost:3000',
        clientId: 'gateway-client',
    };
}
