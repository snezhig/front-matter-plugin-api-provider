export interface ResolverInterface {
    resolver(path: string): string | null
}

export interface ResolverFactory {
    createResolver(feature: string): ResolverInterface;
}
