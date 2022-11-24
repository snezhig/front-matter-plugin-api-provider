import {App} from "obsidian";

export const pluginId = 'obsidian-front-matter-title-plugin'

export class PluginNotEnabledError extends Error {

}

export interface PluginInterface {
    getDefer(): DeferInterface;
}

export interface ApiInterface {
    resolveSync(path: string): string | null;

    resolve(path: string): Promise<string | null>
}

export interface DeferInterface {
    getApi(): ApiInterface | null;

    isPluginReady(): boolean;

    awaitPlugin(): Promise<void>

    isFeaturesReady(): boolean;

    awaitFeatures(): Promise<void>
}

/**
 * returns true if the obsidian-front-matter-title-plugin is enabled
 * @param app
 */
export function isPluginEnabled(app: App): boolean {
    //@ts-ignore
    return app?.plugins?.enabledPlugins?.has(pluginId) ?? false;
}

/**
 *
 * @throws PluginNotEnabledError
 */
export function getDefer(app: App): DeferInterface {
    //@ts-ignore
    const plugin = (app?.plugins?.getPlugin(pluginId) as PluginInterface) ?? null;
    const defer = plugin?.getDefer?.() ?? null;
    if (defer === null) {
        throw new PluginNotEnabledError(`Plugin ${pluginId} is not enabled or old version`);
    }
    return defer;
}

/**
 * Wrapper for object. It will check itself if plugin is enabled and ready
 * @param app
 */
export function getApiSafe(app: App): ApiInterface {
    return new ApiWrapper(null, app);
}

class ApiWrapper implements ApiInterface {
    constructor(
        private api: ApiInterface | null,
        private app: App
    ) {

    }


    private before(): Promise<void> | void {
        if (this.api !== null) {
            return;
        }
        const defer = this.getDeffer();
        if (defer === null) {
            return;
        }
        const api = defer.getApi();
        if (api === null) {
            return defer.awaitPlugin().then(() => {
                this.api = defer.getApi()
            });
        } else {
            this.api = api;
        }
    }

    private getDeffer(): DeferInterface | null {
        try {
            return getDefer(this.app);
        } catch (e) {
            if (e instanceof PluginNotEnabledError) {
                return null;
            }
            throw e;
        }
    }


    /**
     *
     * @param path
     * return null if plugin is not enabled or deffer is not bound
     */
    async resolve(path: string): Promise<string | null> {
        const br = this.before();
        if (br instanceof Promise) {
            await br;
        }
        return await this.api?.resolve(path) ?? null;
    }

    /**
     * returns null if plugin is not enabled or a promise
     * @param path
     */
    resolveSync(path: string): string | null {
        this.before();
        return this.api?.resolveSync(path) ?? null;
    }
}