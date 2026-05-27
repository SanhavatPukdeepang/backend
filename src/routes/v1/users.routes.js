import { Router } from "express";
import { users } from "../../fakeData/fakeUsers.js";
import ApiError from "../../utils/ApiError.js";

export const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, data: users });
});

router.post("/", (req, res, next) => {
  const { username, email } = req.body || {};

  if (!username || !email) {
    return next(new ApiError(400, "username and email are required"));
  }

  // Simple incremental string id based on current mock data
  const nextId = String(
    (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
  );

  const newUser = { id: nextId, username: username, email: email };

  users.push(newUser);

  return res.status(201).json({ success: true, data: newUser });
});

router.put("/:id", (req, res, next) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return next(new ApiError(404, "User not found!"));
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new ApiError(400, "username, email and password are required!"));
  }

  user.username = username;
  user.email = email;
  user.password = password;

  res.status(200).json({ success: true, data: user });
});

router.delete("/:id", (req, res, next) => {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return next(new ApiError(404, "User not found"));
  }
  const [deleted] = users.splice(index, 1);
  res.status(200).json({ success: true, data: deleted });
});
