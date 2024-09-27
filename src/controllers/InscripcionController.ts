import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { CursoEstudiante } from "../models/cursoEstudianteModel";
import { AppDataSource } from "../db/conexion";
import { Estudiante } from "../models/estudianteModel";
import { Curso } from "../models/cursoModel";

export const validar = () => [
  check("estudiante_id")
    .notEmpty()
    .withMessage("El id es obligatorio")
    .isNumeric()
    .withMessage("El ID debe ser un número"),
  check("curso_id")
    .notEmpty()
    .withMessage("El id es obligatorio")
    .isNumeric()
    .withMessage("El ID debe ser un número"),
  check("calificacion")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La calificación debe ser un número entre 0 y 10"),
  (req: Request, res: Response, next: NextFunction) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.render("creaInscripciones", {
        pagina: "Crear Inscripcion",
        errores: errores.array(),
      });
    }
    next();
  },
];

export const consultarInscripciones = async (req: Request, res: Response) => {
  const { estudiante_id, curso_id } = req.query;

  try {
    const cursoEstudianteRepository =
      AppDataSource.getRepository(CursoEstudiante);
    const estudiantesRepository = AppDataSource.getRepository(Estudiante);
    const cursosRepository = AppDataSource.getRepository(Curso);

    const whereConditions: any = {};

    if (estudiante_id) {
      const estudianteIdNumber = Number(estudiante_id);
      if (!isNaN(estudianteIdNumber)) {
        whereConditions.estudiante = { id: estudianteIdNumber };
      }
    }

    if (curso_id) {
      const cursoIdNumber = Number(curso_id);
      if (!isNaN(cursoIdNumber)) {
        whereConditions.curso = { id: cursoIdNumber };
      }
    }

    const cursoEstudiante = await cursoEstudianteRepository.find({
      where: whereConditions,
      relations: ["estudiante", "curso"],
    });

    const estudiantes = await estudiantesRepository.find();
    const cursos = await cursosRepository.find();

    res.render("listarInscripciones", {
      pagina: "Lista de Inscripciones",
      cursoEstudiante,
      estudiantes,
      cursos,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const consultarPorFiltro = async (req: Request, res: Response) => {
  const { estudiante_id, curso_id } = req.params;

  const whereConditions: any = {};
  if (estudiante_id) {
    const estudianteIdNumber = Number(estudiante_id);
    if (!isNaN(estudianteIdNumber)) {
      whereConditions.estudiante = { id: estudianteIdNumber };
    }
  }
  if (curso_id) {
    const cursoIdNumber = Number(curso_id);
    if (!isNaN(cursoIdNumber)) {
      whereConditions.curso = { id: cursoIdNumber };
    }
  }

  try {
    const cursoEstudianteRepository =
      AppDataSource.getRepository(CursoEstudiante);
    const inscripciones = await cursoEstudianteRepository.find({
      where: whereConditions,
      relations: ["curso", "estudiante"],
    });

    if (inscripciones.length === 0) {
      return res
        .status(404)
        .send("No se encontraron inscripciones con los filtros proporcionados");
    }

    return res.render("listarInscripciones", { inscripciones });
  } catch (err: unknown) {
    return res.status(500).send("Error en la consulta");
  }
};

export const mostrarFormularioInscripcion = async (
  req: Request,
  res: Response
) => {
  try {
    const estudianteRepository = AppDataSource.getRepository(Estudiante);
    const cursoRepository = AppDataSource.getRepository(Curso);

    const estudiantes = await estudianteRepository.find();
    const cursos = await cursoRepository.find();

    res.render("creaInscripciones", {
      pagina: "Crear Inscripción",
      estudiantes,
      cursos,
    });
  } catch (error) {
    res.status(500).send("Error al cargar el formulario de inscripción");
  }
};

export const inscribir = async (req: Request, res: Response) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    const estudianteRepository = AppDataSource.getRepository(Estudiante);
    const cursoRepository = AppDataSource.getRepository(Curso);

    const estudiantes = await estudianteRepository.find();
    const cursos = await cursoRepository.find();
    return res.render("creaInscripciones", {
      pagina: "Crear Inscripción",
      estudiantes,
      cursos,
    });
  }

  const { estudiante_id, curso_id, calificacion } = req.body;

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const cursoRepository = transactionalEntityManager.getRepository(Curso);
      const estudianteRepository =
        transactionalEntityManager.getRepository(Estudiante);
      const cursoEstudianteRepository =
        transactionalEntityManager.getRepository(CursoEstudiante);

      const existeEstudiante = await estudianteRepository.findOne({
        where: { id: Number(estudiante_id) },
      });
      if (!existeEstudiante) {
        return res.status(404).json({ mensaje: "El estudiante no existe." });
      }

      const existeCurso = await cursoRepository.findOne({
        where: { id: Number(curso_id) },
      });
      if (!existeCurso) {
        return res.status(404).json({ mensaje: "El curso no existe." });
      }

      const inscripto = await cursoEstudianteRepository.findOne({
        where: { estudiante: { id: estudiante_id }, curso: { id: curso_id } },
      });
      if (inscripto) {
        return res
          .status(400)
          .json({ mensaje: "El estudiante ya está inscripto en este curso." });
      }

      const nuevaInscripcion = cursoEstudianteRepository.create({
        estudiante_id: Number(estudiante_id),
        curso_id: Number(curso_id),
        nota: calificacion,
      });

      await cursoEstudianteRepository.save(nuevaInscripcion);
    });

    res.redirect("/CursosEstudiantes/listarInscripciones");
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const modificar = async (req: Request, res: Response) => {
  try {
    const { estudiante_id, curso_id } = req.params;

    const cursoEstudianteRepository =
      AppDataSource.getRepository(CursoEstudiante);
    const cursoEstudiante = await cursoEstudianteRepository.findOne({
      where: {
        estudiante_id: Number(estudiante_id),
        curso_id: Number(curso_id),
      },
      relations: ["estudiante", "curso"],
    });

    if (!cursoEstudiante) {
      return res.status(404).send("Inscripción no encontrada");
    }

    const estudianteRepository = AppDataSource.getRepository(Estudiante);
    const cursoRepository = AppDataSource.getRepository(Curso);

    const estudiantes = await estudianteRepository.find();
    const cursos = await cursoRepository.find();

    res.render("modificarInscripcion", {
      pagina: "Modificar Inscripción",
      cursoEstudiante,
      estudiantes,
      cursos,
    });
  } catch (error) {
    res.status(500).send("Error al cargar el formulario de modificación");
  }
};

export const actualizarInscripcion = async (req: Request, res: Response) => {
  try {
    const { estudiante_id, curso_id } = req.params;
    const { nota } = req.body;

    const cursoEstudianteRepository =
      AppDataSource.getRepository(CursoEstudiante);

    const cursoEstudiante = await cursoEstudianteRepository.findOne({
      where: {
        estudiante_id: Number(estudiante_id),
        curso_id: Number(curso_id),
      },
    });

    if (!cursoEstudiante) {
      return res.status(404).send("Inscripción no encontrada");
    }

    cursoEstudiante.nota = nota;
    await cursoEstudianteRepository.save(cursoEstudiante);

    res.redirect("/CursosEstudiantes/listarInscripciones");
  } catch (error) {
    res.status(500).send("Error al actualizar la inscripción");
  }
};

export const eliminar = async (req: Request, res: Response) => {
  const { estudiante_id, curso_id } = req.params;

  if (!estudiante_id || !curso_id) {
    return res.status(400).json({ mensaje: "Faltan parámetros" });
  }

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const cursoEstudianteRepository =
        transactionalEntityManager.getRepository(CursoEstudiante);

      const inscripcion = await cursoEstudianteRepository.findOne({
        where: {
          estudiante_id: Number(estudiante_id),
          curso_id: Number(curso_id),
        },
      });

      if (!inscripcion) {
        throw new Error("La inscripción no existe");
      }

      await cursoEstudianteRepository.remove(inscripcion);

      return res.json({ mensaje: "Inscripción eliminada" });
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ mensaje: err.message });
    }
  }
};
