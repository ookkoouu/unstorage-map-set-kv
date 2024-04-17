import equal from "fast-deep-equal";
import type { Driver, StorageValue, Unwatch } from "unstorage";
import type { MaybePromise, WatchCallback } from "./types";
import { memoryDriver, parse, stringify } from "./utils";

export interface SetStorage<T extends StorageValue> {
	add: (value: T) => Promise<void>;
	clear: () => Promise<void>;
	delete: (value: T) => Promise<boolean>;
	entries: () => Promise<[T, T][]>;
	forEach: (
		callbackfn: (value: T, value2: T, arr: T[]) => MaybePromise,
	) => Promise<void>;
	has: (value: T) => Promise<boolean>;
	keys: () => Promise<T[]>;
	values: () => Promise<T[]>;
	watch: (callback: WatchCallback<T[]>) => Promise<Unwatch>;
}

export interface SetStorageOptions {
	driver?: Driver;
}

export function createSetStorage<T extends StorageValue>(
	key: string,
	opts: SetStorageOptions = {},
): SetStorage<T> {
	const _driver = opts.driver ?? (memoryDriver() as Driver);
	const _key = key;

	const _set = (value: T[]) => {
		if (_driver.setItem === undefined) return;
		return _driver.setItem(_key, stringify(value), {});
	};
	const _get = async () => {
		const val = parse<T[]>(await _driver.getItem(_key));
		if (!Array.isArray(val)) return [];
		return val;
	};

	return {
		async add(value) {
			const val = (await _get()).filter((e) => !equal(e, value));
			val.push(value);
			await _set(val);
		},

		async clear() {
			await _set([]);
		},

		async delete(value) {
			const val = await _get();
			const res = val.some((e) => equal(e, value));
			if (res) {
				await _set(val.filter((e) => !equal(e, value)));
			}
			return res;
		},

		async entries() {
			return (await _get()).map((e) => [e, e]);
		},

		async forEach(callbackfn) {
			const val = await _get();
			await val.forEach((v, _, arr) => callbackfn(v, v, arr));
		},

		async has(key) {
			const val = await _get();
			return val.some((e) => equal(e, key));
		},

		async keys() {
			return _get();
		},

		async values() {
			return _get();
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
