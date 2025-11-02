import express from "express";
import { createRoom, getAllRooms, getRoomsByUser, getNextRoomId, getRoomById } from "../controllers/roomController.js";

const router = express.Router();

// IMPORTANT: Specific routes MUST come before parameterized routes
router.post("/create", createRoom);
router.get("/all", getAllRooms);
router.get("/user/:userId", getRoomsByUser);  // Specific route - must be before /:roomId
router.get("/next-id/:villaId", getNextRoomId);  // Specific route - must be before /:roomId
router.get("/:roomId", getRoomById);  // Generic route - MUST be last

export default router;