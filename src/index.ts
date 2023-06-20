import { App } from "obsidian";
import { DeferInterface, ApiInterface } from "./contracts/Api";
import { EventDispatcherInterface, Events } from "./contracts/EventDispatcher";
import { ResolverFactory } from "./contracts/Resolver";

export * from "./contracts/Api"
export * from "./contracts/EventDispatcher"
export * from "./contracts/Resolver"

export const pluginId = 'obsidian-front-matter-title-plugin'

export class PluginNotEnabledError extends Error {

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

    getResolverFactory(): ResolverFactory | null {
        this.before();
        return this.api?.getResolverFactory() ?? null;
    }

    getEventDispatcher(): EventDispatcherInterface<Events> | null {
        this.before();
        return this.api?.getEventDispatcher() ?? null;
    }

    getEnabledFeatures(): string[] {
        this.before();
        return this.api?.getEnabledFeatures() ?? [];
    }
}