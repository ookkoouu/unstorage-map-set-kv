# unstorage-map-set-kv

## Usage
```ts
import { createKVStorage } from "../src/kv";

const kv = {
	key: "value",
	useFor: ["default", "value"],
};

const storage = createKVStorage("key", { init: kv, /* driver: */ });

await storage.getItem("useFor"); // => Promise<string[]>
```

## Interface
- [MapStorage](https://github.com/ookkoouu/unstorage-map-set-kv/blob/main/src/map.ts)
- [SetStorage](https://github.com/ookkoouu/unstorage-map-set-kv/blob/main/src/set.ts)
- [KVStorage](https://github.com/ookkoouu/unstorage-map-set-kv/blob/main/src/kv.ts)

