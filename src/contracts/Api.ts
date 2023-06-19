import { EventDispatcherInterface, Events } from "./EventDispatcher";
import { ResolverFactory } from "./Resolver";

export interface PluginInterface {
    getDefer(): DeferInterface;
}

export interface ApiInterface {
    getResolverFactory(): ResolverFactory | null;
    getEventDispatcher(): EventDispatcherInterface<Events> | null;
    getEnabledFeatures(): string[];
}

export interface DeferInterface {
    getApi(): ApiInterface | null;

    isPluginReady(): boolean;

    awaitPlugin(): Promise<void>

    isFeaturesReady(): boolean;

    awaitFeatures(): Promise<void>
}