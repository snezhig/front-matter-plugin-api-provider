import {App} from "obsidian";

export const pluginId = 'obsidian-front-matter-title-plugin'

export class PluginNotEnabledError extends Error {

}

export class PluginBindIncompleteError extends Error {

}

export interface Api {
    resolveSync(path: string): string | null;

    resolve(path: string): Promise<string | null>
}

export interface Deffer {
    /**@throws PluginBindIncompleteError*/
    getApi(): Api;
}

export interface BindDeffer extends Deffer {
    /*
     * After resolve API object will be available
     */
    awaitBind(): Promise<BootDeffer>

    /**
     * if true, getApi will return an object otherwise throw an exception
     */
    isBound(): boolean

}

export interface BootDeffer extends Deffer {
    isBooted(): boolean

    /**
     * wait until plugin boot all managers after manual delay (depends on user's settings)
     */
    awaitBoot(): Promise<void>
}

export interface Plugin {
    getDeffer(): BindDeffer;
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
export function getDeffer(app: App): BindDeffer {
    //@ts-ignore
    const plugin = (app?.plugins?.getPlugin(pluginId) as Plugin) ?? null;
    const deffer = plugin?.getDeffer() ?? null;
    if (deffer === null) {
        throw new PluginNotEnabledError();
    }
    return deffer;
}

/**
 * Wrapper for object. It will check itself if plugin is enabled and defer is bound
 * @param app
 */
export function getApiSafe(app: App): Api {
    return new ApiWrapper(null, app);
}

class ApiWrapper implements Api {
    constructor(
        private api: Api | null,
        private app: App
    ) {

    }

    private before(): Promise<void> | void {
        if (this.api === null) {
            const deffer = getDeffer(this.app);
            try {
                this.api = deffer.getApi();
            } catch (e) {
                if (e instanceof PluginNotEnabledError) {
                    this.api = null;
                    return;
                } else if (e instanceof PluginBindIncompleteError) {
                    return deffer.awaitBind().then(() => {
                        this.api = deffer.getApi();
                    });
                }
                throw e;
            }
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
        return this.resolveSync(path) ?? null;
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