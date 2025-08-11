import express from "express";
import { createRoom, getAllRooms } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.get("/all", getAllRooms);

export default router;