import { describe, expect, it, vi } from "vitest";
import { createKVStorage } from "../src/kv";

type Testcase<T, K extends keyof T = keyof T> = {
	name: K;
	input: T[K];
};

describe("get/set", () => {
	const entries = {
		str: "",
		num: 0,
		bool: false,
		obj: { a: [123] },
		arr: [0, "", false, { "": 0 }],
	};
	const tests: Testcase<typeof entries>[] = [
		{ name: "str", input: "test" },
		{ name: "num", input: 123 },
		{ name: "bool", input: true },
		{ name: "obj", input: { a: [345] } },
		{ name: "arr", input: ["test", true, 1, { "": 1 }] },
	];

	for (const test of tests) {
		it(test.name, async () => {
			const storage = createKVStorage("test", {
				init: entries,
			});

			await storage.setItem(test.name, test.input);
			const output = await storage.getItem(test.name);
			expect(output).toStrictEqual(test.input);
		});
	}
});

describe("watch", () => {
	const entries = {
		str: "",
		num: 0,
		bool: false,
		obj: { a: [123] },
		arr: [0, "", false, { "": 0 }],
	};
	const tests: Testcase<typeof entries>[] = [
		{ name: "str", input: "test" },
		{ name: "num", input: 123 },
		{ name: "bool", input: true },
		{ name: "obj", input: { a: [345] } },
		{ name: "arr", input: ["test", true, 1, { "": 1 }] },
	];

	for (const test of tests) {
		it(test.name, async () => {
			const storage = createKVStorage("test", {
				init: entries,
			});
			const listener = vi.fn((newValue) => newValue);
			await storage.watchItem(test.name, listener);

			await storage.setItem(test.name, test.input);
			expect(listener).toHaveBeenLastCalledWith(test.input);
		});
	}
});
