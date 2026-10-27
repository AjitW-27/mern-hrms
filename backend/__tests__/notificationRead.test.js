const { Notification } = require("../models/otherModel");
const { markOneRead } = require("../controllers/otherControllers");
const response = () => { const res = {}; res.status = jest.fn(() => res); res.json = jest.fn(() => res); return res; };
afterEach(() => jest.restoreAllMocks());
test("mark read scopes the database mutation to the authenticated recipient", async () => {
  const id = "0123456789abcdef01234567";
  jest.spyOn(Notification, "findOneAndUpdate").mockResolvedValue({ _id: id, isRead: true });
  const res = response();
  await markOneRead({ params: { id }, user: { _id: "recipient" } }, res);
  expect(Notification.findOneAndUpdate).toHaveBeenCalledWith({ _id: id, recipient: "recipient" }, { $set: { isRead: true, readAt: expect.any(Date) } }, { new: true });
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});
test("cannot mark a missing or another recipient's notification", async () => {
  jest.spyOn(Notification, "findOneAndUpdate").mockResolvedValue(null);
  const res = response();
  await markOneRead({ params: { id: "0123456789abcdef01234567" }, user: { _id: "recipient" } }, res);
  expect(res.status).toHaveBeenCalledWith(404);
});
test("rejects malformed notification IDs without querying the database", async () => {
  jest.spyOn(Notification, "findOneAndUpdate");
  const res = response();
  await markOneRead({ params: { id: "invalid" }, user: { _id: "recipient" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(Notification.findOneAndUpdate).not.toHaveBeenCalled();
});
