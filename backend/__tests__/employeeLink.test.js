const User = require("../models/userModel");
const Employee = require("../models/employeeModel");
const { linkEmployee } = require("../controllers/userController");
const response = () => { const res = {}; res.status = jest.fn(() => res); res.json = jest.fn(() => res); return res; };
afterEach(() => jest.restoreAllMocks());
test("linking refuses to steal another account's employee profile", async () => {
  jest.spyOn(User, "findById").mockResolvedValue({ _id: "target" });
  jest.spyOn(Employee, "findById").mockResolvedValue({ _id: "employee", userId: "other-user" });
  jest.spyOn(User, "updateOne");
  const res = response();
  await linkEmployee({ userRole: "admin", params: { id: "target" }, body: { employeeRef: "0123456789abcdef01234567" } }, res, error => { throw error; });
  expect(res.status).toHaveBeenCalledWith(409);
  expect(User.updateOne).not.toHaveBeenCalled();
});
test("linking sets the existing forward and reverse references", async () => {
  const id = "0123456789abcdef01234567";
  jest.spyOn(User, "findById").mockResolvedValue({ _id: "target" });
  jest.spyOn(Employee, "findById").mockResolvedValue({ _id: id });
  jest.spyOn(User, "findOne").mockReturnValue({ select: async () => null });
  jest.spyOn(Employee, "updateOne").mockResolvedValue({ matchedCount: 1 });
  jest.spyOn(User, "updateOne").mockResolvedValue({ matchedCount: 1 });
  const res = response();
  await linkEmployee({ userRole: "admin", params: { id: "target" }, body: { employeeRef: id } }, res, error => { throw error; });
  expect(User.updateOne).toHaveBeenCalledWith({ _id: "target" }, { $set: { employeeRef: id } });
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});
test("normal employees cannot link profiles even when global RBAC is disabled", async () => {
  const res = response();
  jest.spyOn(User, "updateOne");
  await linkEmployee({ userRole: "employee", body: { employeeRef: "0123456789abcdef01234567" } }, res, error => { throw error; });
  expect(res.status).toHaveBeenCalledWith(403);
  expect(User.updateOne).not.toHaveBeenCalled();
});
