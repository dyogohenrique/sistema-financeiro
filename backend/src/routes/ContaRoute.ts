import { Router, Request, Response } from "express";
import ContaController from "@/controllers/ContaController";

const router = Router();

router.post("/criar", ContaController.criar);
router.get("/listar", ContaController.listar);
router.get("/:id", ContaController.buscarPorId);
router.patch("/editar/:id", ContaController.atualizar);
router.patch("/ativar/:id", ContaController.ativar);
router.patch("/desativar/:id", ContaController.desativar);

export default router;
