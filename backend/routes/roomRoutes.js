import express from "express";
import { createRoom, getAllRooms, getRoomsByUser } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.get("/all", getAllRooms);

router.get('/user/:userId', getRoomsByUser);

export default router;