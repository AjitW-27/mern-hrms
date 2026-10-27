import test from "node:test";
import assert from "node:assert/strict";
import { modulePayload } from "../src/lib/moduleForm.js";
test("shared forms omit blank optional enums/references so database defaults and casts remain valid", () => {
 const fields = [{ name: "assignedTo", optionsEndpoint: "/employees" }, { name: "status", options: ["Available"] }, { name: "purchaseDate", type: "date" }];
 assert.deepEqual(modulePayload(fields, { assignedTo: "", status: "", purchaseDate: "" }), {});
 assert.deepEqual(modulePayload(fields, { assignedTo: "", status: "", purchaseDate: "" }, true), { assignedTo: null, purchaseDate: null });
 assert.equal(modulePayload(fields, { assignedTo: { _id: "employee" } }).assignedTo, "employee");
});
