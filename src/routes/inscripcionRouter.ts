import express from "express";
import {
  inscribir,
  eliminar,
  validar,
  consultarPorFiltro,
  consultarInscripciones,
  modificar,
  actualizarInscripcion,
  mostrarFormularioInscripcion,
} from "../controllers/InscripcionController";

const router = express.Router();

// Listar
router.get("/listarInscripciones", consultarInscripciones);
router.get("/CursosEstudiantes/listarInscripciones", consultarPorFiltro);

// Insertar
router.get("/creaInscripciones", mostrarFormularioInscripcion);
router.post("/creaInscripciones", validar(), inscribir);

// Modificar
router.get("/modificarInscripcion/:estudiante_id/:curso_id", modificar);

router.post(
  "/actualizarInscripcion/:estudiante_id/:curso_id",
  actualizarInscripcion
);
// Eliminar

router.delete("/:estudiante_id/:curso_id", eliminar);

export default router;
