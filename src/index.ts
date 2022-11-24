import {App} from "obsidian";

export const pluginId = 'obsidian-front-matter-title-plugin'

export class PluginNotEnabledError extends Error {

}

export interface PluginInterface {
    getDeffer(): DefferInterface;
}

export interface ApiInterface {
    resolveSync(path: string): string | null;

    resolve(path: string): Promise<string | null>
}

export interface DefferInterface {
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
export function getDeffer(app: App): DefferInterface {
    //@ts-ignore
    const plugin = (app?.plugins?.getPlugin(pluginId) as PluginInterface) ?? null;
    const deffer = plugin?.getDeffer() ?? null;
    if (deffer === null) {
        throw new PluginNotEnabledError(`Plugin ${pluginId} is not enabled or old version`);
    }
    return deffer;
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
        const deffer = this.getDeffer();
        if (deffer === null) {
            return;
        }
        const api = deffer.getApi();
        if (api === null) {
            return deffer.awaitPlugin().then(() => {
                this.api = deffer.getApi()
            });
        } else {
            this.api = api;
        }
    }

    private getDeffer(): DefferInterface | null {
        try {
            return getDeffer(this.app);
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