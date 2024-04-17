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
- [MapStorage]()
- [SetStorage]()
- [KVStorage]()

