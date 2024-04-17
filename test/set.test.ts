import type { StorageValue } from "unstorage";
import { describe, expect, it, vi } from "vitest";
import { createSetStorage } from "../src/set";

type Testcase = { name: string; input: StorageValue };

function getStorage() {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return createSetStorage<any>("test");
}

describe("get/set", () => {
	const tests: Testcase[] = [
		{ name: "str", input: "test" },
		{ name: "num", input: 123 },
		{ name: "bool", input: true },
		{ name: "obj", input: { a: [345] } },
		{ name: "arr", input: ["test", true, 1, { "": 1 }] },
	];

	for (const test of tests) {
		const storage = getStorage();
		it(test.name, async () => {
			await storage.add(test.input);
			const output = [...(await storage.values())];
			expect(output).toStrictEqual([test.input]);
		});
	}
});

describe("has", () => {
	const tests: Testcase[] = [
		{ name: "str", input: "test" },
		{ name: "num", input: 123 },
		{ name: "bool", input: true },
		{ name: "obj", input: { a: [345] } },
		{ name: "arr", input: ["test", true, 1, { "": 1 }] },
	];
	const others = structuredClone(
		Object.fromEntries(tests.map((t) => [t.name, t.input])),
	);

	for (const test of tests) {
		const storage = getStorage();
		it(test.name, async () => {
			await storage.add(test.input);
			const output = await storage.has(others[test.name]);
			expect(output).toBe(true);
		});
	}
});

describe("delete", () => {
	const tests: Testcase[] = [
		{ name: "str", input: "test" },
		{ name: "num", input: 123 },
		{ name: "bool", input: true },
		{ name: "obj", input: { a: [345] } },
		{ name: "arr", input: ["test", true, 1, { "": 1 }] },
	];
	const others = structuredClone(
		Object.fromEntries(tests.map((t) => [t.name, t.input])),
	);

	for (const test of tests) {
		const storage = getStorage();
		it(test.name, async () => {
			await storage.add(test.input);
			expect(await storage.has(test.input)).not.toBe(undefined);
			const output = await storage.delete(others[test.name]);
			expect(output).toBe(true);
			expect(await storage.has(test.input)).toBe(false);
		});
	}
});

describe("watch", () => {
	const tests: Testcase[] = [
		{ name: "str", input: "test" },
		{ name: "num", input: 123 },
		{ name: "bool", input: true },
		{ name: "obj", input: { a: [345] } },
		{ name: "arr", input: ["test", true, 1, { "": 1 }] },
	];

	for (const test of tests) {
		const storage = getStorage();
		it(test.name, async () => {
			const listener = vi.fn((newValue) => newValue);
			await storage.watch(listener);
			await storage.add(test.input);

			expect(listener).toHaveBeenCalledWith([test.input]);
		});
	}
});
