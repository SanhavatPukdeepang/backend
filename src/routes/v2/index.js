import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";
import { router as usersSupabaseRoutes } from "./users.supabase.routes.js";

export const router = Router();

router.use("/users", usersRoutes);
router.use("/users/supabase", usersSupabaseRoutes);

// router.use("/products", productsRoutes);

// router.use("/notes", notesRoutes);
