import express from "express";
import {
  insertar,
  modificar,
  eliminar,
  validar,
  consultarUno,
  consultarTodos,
} from "../controllers/ProfesoresController";

const router = express.Router();

router.get("/listarProfesores", consultarTodos);

// Insertar
router.get("/creaProfesores", (req, res) => {
  res.render("creaProfesores", {
    pagina: "Crear Profesor",
  });
});

router.post("/", validar(), insertar);

// Modificar
router.get("/modificaProfesor/:id", async (req, res) => {
  try {
    const profesor = await consultarUno(req, res);
    if (!profesor) {
      return res.status(404).send("Profesor no encontrado");
    }
    res.render("modificaProfesor", {
      profesor,
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
