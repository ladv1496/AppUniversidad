import express from "express";
import {
  insertar,
  modificar,
  eliminar,
  validar,
  consultarUno,
  consultarTodos,
} from "../controllers/CursoController";

const router = express.Router();

router.get("/listarCursos", consultarTodos);

// Insertar

router.get("/creaCursos", (req, res) => {
  res.render("creaCursos", {
    pagina: "Crear Curso",
  });
});

router.post("/", validar(), insertar);

// Modificar

router.get("/modificaCurso/:id", async (req, res) => {
  try {
    const curso = await consultarUno(req, res);
    if (!curso) {
      return res.status(404).send("Curso no encontrado");
    }
    res.render("modificaCurso", {
      curso,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
});

router.put("/:id", modificar);

// Eliminar
router.delete("/:id", eliminar);

export default router;
