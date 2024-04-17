/**
 * @link https://github.com/unjs/unstorage/blob/862d825ed99f0c1245d57cb5f8a19447253ae575/src/_utils.ts
 * @license MIT License: Copyright (c) Pooya Parsa <pooya@pi0.io>
 */
import destr from "destr";
import { type WatchCallback, defineDriver } from "unstorage";

function isPrimitive(value: unknown) {
	const type = typeof value;
	return value === null || (type !== "object" && type !== "function");
}

function isPureObject(value: unknown) {
	const proto = Object.getPrototypeOf(value);
	// biome-ignore lint/suspicious/noPrototypeBuiltins:
	return !proto || proto.isPrototypeOf(Object);
}

// biome-ignore lint/suspicious/noExplicitAny:
export function stringify(value: any): string {
	if (isPrimitive(value)) {
		return String(value);
	}

	if (isPureObject(value) || Array.isArray(value)) {
		return JSON.stringify(value);
	}

	if (typeof value.toJSON === "function") {
		return stringify(value.toJSON());
	}

	throw new Error("[unstorage] Cannot stringify value!");
}

export function parse<T>(value: unknown): T {
	return destr<T>(value);
}

export const memoryDriver = defineDriver<void>(() => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const data = new Map<string, any>();
	const wathers = new Set<WatchCallback>();

	return {
		name: "memory",
		options: {},
		hasItem(key) {
			return data.has(key);
		},
		getItem(key) {
			return data.get(key) ?? null;
		},
		getItemRaw(key) {
			return data.get(key) ?? null;
		},
		setItem(key, value) {
			data.set(key, value);
			for (const cb of wathers) {
				cb("update", key);
			}
		},
		setItemRaw(key, value) {
			data.set(key, value);
			for (const cb of wathers) {
				cb("update", key);
			}
		},
		removeItem(key) {
			data.delete(key);
			for (const cb of wathers) {
				cb("remove", key);
			}
		},
		getKeys() {
			return Array.from(data.keys());
		},
		clear() {
			data.clear();
			for (const [k, _] of data) {
				for (const cb of wathers) {
					cb("remove", k);
				}
			}
		},
		dispose() {
			data.clear();
			wathers.clear();
		},
		watch(callback) {
			wathers.add(callback);
			return () => void wathers.delete(callback);
		},
	};
});
