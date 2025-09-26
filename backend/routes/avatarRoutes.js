import express from "express";
import { uploadAvatar } from "../controllers/avatarController.js";

const router = express.Router();

router.post('/upload', uploadAvatar);

export default router;
