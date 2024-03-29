export interface ResolverInterface {
    resolve(path: string): string | null
}

export interface ResolverFactory {
    createResolver(feature: string): ResolverInterface;
}
