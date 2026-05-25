import { User } from "./user.model.js";
import {
  embedText,
  GEMINI_EMBEDDING_DIMS,
} from "../../services/gemini.client.js";

const buildUserEmbeddingText = (userDoc) => {
  const username = userDoc?.username ? String(userDoc.username).trim() : "";
  const email = userDoc?.email ? String(userDoc.email).trim() : "";
  const role = userDoc?.role ? String(userDoc.role).trim() : "user";

  return [
    "User profile:",
    `Username: ${username}`,
    `Email: ${email}`,
    `Role: ${role}`,
  ].join("\n");
};

export const embedUserById = async (userId) => {
  if (!userId) {
    const err = new Error("userId is required");
    err.name = "ValidationError";
    err.status = 400;
    throw err;
  }

  // Mark as processing (best-effort). We don't fail if this doesn't match.
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "embedding.status": "PROCESSING",
        "embedding.lastAttemptAt": new Date(),
      },
      $inc: { "embedding.attempts": 1 },
    },
    { new: false }
  );

  try {
    const user = await User.findById(userId).select(
      "username email role embedding.status"
    );

    if (!user) {
      const err = new Error("User not found");
      err.name = "NotFoundError";
      err.status = 404;
      throw err;
    }

    const text = buildUserEmbeddingText(user);
    const vector = await embedText({ text });

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "embedding.status": "READY",
          "embedding.vector": vector,
          "embedding.dims": GEMINI_EMBEDDING_DIMS,
          "embedding.updatedAt": new Date(),
          "embedding.lastError": null,
        },
      },
      { new: false }
    );

    return { ok: true };
  } catch (err) {
    const message = String(err?.message || "Embedding failed").slice(0, 500);

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "embedding.status": "FAILED",
          "embedding.lastError": message,
        },
      },
      { new: false }
    );

    return { ok: false, error: message };
  }
};

export const queueEmbedUserById = (userId) => {
  setImmediate(() => {
    embedUserById(userId).catch((err) => {
      console.error("Async user embedding failed", {
        userId,
        message: err?.message,
      });
    });
  });
};