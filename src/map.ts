import equal from "fast-deep-equal";
import type { Driver, StorageValue, Unwatch } from "unstorage";
import type { MaybePromise, WatchCallback } from "./types";
import { memoryDriver, parse, stringify } from "./utils";

export interface MapStorage<K extends StorageValue, V extends StorageValue> {
	clear: () => Promise<void>;
	delete: (key: K) => Promise<boolean>;
	entries: () => Promise<[K, V][]>;
	forEach: (
		callbackfn: (value: V, key: K, arr: [K, V][]) => MaybePromise,
	) => Promise<void>;
	get: (key: K) => Promise<V | undefined>;
	has: (key: K) => Promise<boolean>;
	keys: () => Promise<K[]>;
	set: (key: K, value: V) => Promise<void>;
	values: () => Promise<V[]>;
	watch: (callback: WatchCallback<[K, V][]>) => Promise<Unwatch>;
}

export interface MapStorageOptions {
	driver?: Driver;
}

export function createMapStorage<
	K extends StorageValue,
	V extends StorageValue,
>(key: string, opts: MapStorageOptions = {}): MapStorage<K, V> {
	const _driver = opts.driver ?? (memoryDriver() as Driver);
	const _key = key;

	const _set = (value: [K, V][]) => {
		if (_driver.setItem === undefined) return;
		return _driver.setItem(_key, stringify(value), {});
	};
	const _get = async () => {
		const val = parse<[K, V][]>(await _driver.getItem(_key));
		if (!Array.isArray(val)) return [];
		return val;
	};

	return {
		async clear() {
			await _set([]);
		},

		async delete(key) {
			const val = await _get();
			const res = val.some((e) => equal(e[0], key));
			if (res) {
				await _set(val.filter((e) => !equal(e[0], key)));
			}
			return res;
		},

		async entries() {
			return _get();
		},

		async forEach(callbackfn) {
			const val = await _get();
			await val.forEach(([k, v], _, arr) => callbackfn(v, k, arr));
		},

		async get(key) {
			const val = await _get();
			return val.find((e) => equal(e[0], key))?.[1];
		},

		async has(key) {
			const val = await _get();
			return val.some((e) => equal(e[0], key));
		},

		async keys() {
			return (await _get()).map((e) => e[0]);
		},

		async set(key, value) {
			const val = (await _get()).filter((e) => !equal(e[0], key));
			val.push([key, value]);
			await _set(val);
		},

		async values() {
			return (await _get()).map((e) => e[1]);
		},

		async watch(callback) {
			if (_driver.watch === undefined) {
				return () => undefined;
			}
			const unwatch = await _driver.watch(async (e, k) => {
				if (e !== "update" || k !== _key) return;
				const newValue = await _get();
				await callback(newValue);
			});

			return () => unwatch();
		},
	};
}
