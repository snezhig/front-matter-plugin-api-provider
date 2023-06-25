## Obsidian Front Matter Title Plugin Api Provider

This package provide some functions to get API from to resolve file titles
by [Front Matter Title](https://github.com/Snezhig/obsidian-front-matter-title) which is required to be installed


## Installation
`npm i front-matter-plugin-api-provider`

## Get Api Instance

```typescript
import {getDefer} from "front-matter-plugin-api-provider";

const path = 'Folder/ds1.md';
const defer = getDefer(this.app);
let api = null;
if (defer.isPluginReady()) {
    api = defer.getApi();
} else {
    await defer.awaitPlugin();
    api = defer.getApi();
    //if you want to wait features you can use the following chain
    if (!defer.isFeaturesReady()) {
        await defer.awaitFeatures();
    }
}
```

or you can use **Safe Wrapper**

```typescript
import {getApiSafe} from "front-matter-plugin-api-provider";

const path = 'Folder/ds1.md';
//Wrapper will check
const api = getApiSafe(this.app);
```

## Use Api Instance

## Get enabled features
```typescript
const api: ApiInterface;

//It will return list of enabled features.
const ids = api.getEnabledFeatures();
```
### Get resolver
```typescript
const api: ApiInterface;

//Get factory and create a resolver for feature.
//WARNING: if you pass disabled feature id, you will get a resolver which returns value by settings for features.
const resolver = api.getResolverFactory().createResolver('#feature-id#');
console.log(resolver.resolve('file.md'));
```
### Get event dispatcher
```typescript
const api: ApiInterface;

const dispatcher = api.getEventDispatcher();
const event = {
    name: "manager:update",
    cb: console.log
}
//Keep ref to remove listener
const ref = dispatcher.addListener(event);
//Remove listener, if needed
dispatcher.removeListener(ref)
```
