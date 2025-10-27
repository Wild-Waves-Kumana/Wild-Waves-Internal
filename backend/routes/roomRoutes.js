import express from "express";
import { createRoom, getAllRooms, getRoomsByUser, getNextRoomId } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.get("/all", getAllRooms);
router.get("/user/:userId", getRoomsByUser);
router.get("/next-id/:villaId", getNextRoomId); // New route

export default router;