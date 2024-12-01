import { Router, Request, Response } from "express";
import ContaController from "@/controllers/ContaController";

const router = Router();

router.post("/criar", ContaController.criar);

export default router;
