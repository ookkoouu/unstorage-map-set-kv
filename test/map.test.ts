import type { StorageValue } from "unstorage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMapStorage } from "../src/map";

describe("get", () => {
	const tests: { name: string; input: [StorageValue, StorageValue] }[] = [
		{ name: "str", input: ["test_key", "test_value"] },
		{ name: "num", input: [1, 1234] },
		{ name: "bool", input: [false, true] },
		{ name: "obj", input: [{ key: "k" }, { value: "v" }] },
		{
			name: "arr",
			input: [
				[0, "key"],
				[1, "value"],
			],
		},
	];

	for (const test of tests) {
		it(test.name, async () => {
			const storage = createMapStorage("test");
			await storage.set(...test.input);
			const output = await storage.get(test.input[0]);
			expect(output).toStrictEqual(test.input[1]);
		});
	}
});

describe("has", () => {
	const tests: { name: string; input: [StorageValue, StorageValue] }[] = [
		{ name: "str", input: ["test_key", "test_value"] },
		{ name: "num", input: [1, 1234] },
		{ name: "bool", input: [false, true] },
		{ name: "obj", input: [{ key: "k" }, { value: "v" }] },
		{
			name: "arr",
			input: [
				[0, "key"],
				[1, "value"],
			],
		},
	];

	for (const test of tests) {
		it(test.name, async () => {
			const storage = createMapStorage("test");
			await storage.set(...test.input);
			const output = await storage.has(test.input[0]);
			expect(output).toBe(true);
		});
	}
});

describe("delete", () => {
	const tests: { name: string; input: [StorageValue, StorageValue] }[] = [
		{ name: "str", input: ["test_key", "test_value"] },
		{ name: "num", input: [1, 1234] },
		{ name: "bool", input: [false, true] },
		{ name: "obj", input: [{ key: "k" }, { value: "v" }] },
		{
			name: "arr",
			input: [
				[0, "key"],
				[1, "value"],
			],
		},
	];

	for (const test of tests) {
		it(test.name, async () => {
			const storage = createMapStorage("test");
			await storage.set(...test.input);
			expect(await storage.get(test.input[0])).not.toBe(undefined);
			const output = await storage.delete(test.input[0]);
			expect(output).toBe(true);
			expect(await storage.get(test.input[0])).toBe(undefined);
		});
	}
});

describe("watch", () => {
	const tests: { name: string; input: [StorageValue, StorageValue] }[] = [
		{ name: "str", input: ["test_key", "test_value"] },
		{ name: "num", input: [1, 1234] },
		{ name: "bool", input: [false, true] },
		{ name: "obj", input: [{ key: "k" }, { value: "v" }] },
		{
			name: "arr",
			input: [
				[0, "key"],
				[1, "value"],
			],
		},
	];

	for (const test of tests) {
		it(test.name, async () => {
			const storage = createMapStorage("test");
			const listener = vi.fn((newValue) => newValue);
			await storage.watch(listener);
			await storage.set(...test.input);

			expect(listener).toHaveBeenCalledWith([test.input]);
		});
	}
});
