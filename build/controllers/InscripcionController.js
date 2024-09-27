"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminar = exports.actualizarInscripcion = exports.modificar = exports.inscribir = exports.mostrarFormularioInscripcion = exports.consultarPorFiltro = exports.consultarInscripciones = exports.validar = void 0;
const express_validator_1 = require("express-validator");
const cursoEstudianteModel_1 = require("../models/cursoEstudianteModel");
const conexion_1 = require("../db/conexion");
const estudianteModel_1 = require("../models/estudianteModel");
const cursoModel_1 = require("../models/cursoModel");
const validar = () => [
    (0, express_validator_1.check)("estudiante_id")
        .notEmpty()
        .withMessage("El id es obligatorio")
        .isNumeric()
        .withMessage("El ID debe ser un número"),
    (0, express_validator_1.check)("curso_id")
        .notEmpty()
        .withMessage("El id es obligatorio")
        .isNumeric()
        .withMessage("El ID debe ser un número"),
    (0, express_validator_1.check)("calificacion")
        .isFloat({ min: 0, max: 10 })
        .withMessage("La calificación debe ser un número entre 0 y 10"),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            return res.render("creaInscripciones", {
                pagina: "Crear Inscripcion",
                errores: errores.array(),
            });
        }
        next();
    },
];
exports.validar = validar;
const consultarInscripciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estudiante_id, curso_id } = req.query;
    try {
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(cursoEstudianteModel_1.CursoEstudiante);
        const estudiantesRepository = conexion_1.AppDataSource.getRepository(estudianteModel_1.Estudiante);
        const cursosRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const whereConditions = {};
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
        const cursoEstudiante = yield cursoEstudianteRepository.find({
            where: whereConditions,
            relations: ["estudiante", "curso"],
        });
        const estudiantes = yield estudiantesRepository.find();
        const cursos = yield cursosRepository.find();
        res.render("listarInscripciones", {
            pagina: "Lista de Inscripciones",
            cursoEstudiante,
            estudiantes,
            cursos,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarInscripciones = consultarInscripciones;
const consultarPorFiltro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estudiante_id, curso_id } = req.params;
    const whereConditions = {};
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
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(cursoEstudianteModel_1.CursoEstudiante);
        const inscripciones = yield cursoEstudianteRepository.find({
            where: whereConditions,
            relations: ["curso", "estudiante"],
        });
        if (inscripciones.length === 0) {
            return res
                .status(404)
                .send("No se encontraron inscripciones con los filtros proporcionados");
        }
        return res.render("listarInscripciones", { inscripciones });
    }
    catch (err) {
        return res.status(500).send("Error en la consulta");
    }
});
exports.consultarPorFiltro = consultarPorFiltro;
const mostrarFormularioInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudianteRepository = conexion_1.AppDataSource.getRepository(estudianteModel_1.Estudiante);
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const estudiantes = yield estudianteRepository.find();
        const cursos = yield cursoRepository.find();
        res.render("creaInscripciones", {
            pagina: "Crear Inscripción",
            estudiantes,
            cursos,
        });
    }
    catch (error) {
        res.status(500).send("Error al cargar el formulario de inscripción");
    }
});
exports.mostrarFormularioInscripcion = mostrarFormularioInscripcion;
const inscribir = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        const estudianteRepository = conexion_1.AppDataSource.getRepository(estudianteModel_1.Estudiante);
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const estudiantes = yield estudianteRepository.find();
        const cursos = yield cursoRepository.find();
        return res.render("creaInscripciones", {
            pagina: "Crear Inscripción",
            estudiantes,
            cursos,
        });
    }
    const { estudiante_id, curso_id, calificacion } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoRepository = transactionalEntityManager.getRepository(cursoModel_1.Curso);
            const estudianteRepository = transactionalEntityManager.getRepository(estudianteModel_1.Estudiante);
            const cursoEstudianteRepository = transactionalEntityManager.getRepository(cursoEstudianteModel_1.CursoEstudiante);
            const existeEstudiante = yield estudianteRepository.findOne({
                where: { id: Number(estudiante_id) },
            });
            if (!existeEstudiante) {
                return res.status(404).json({ mensaje: "El estudiante no existe." });
            }
            const existeCurso = yield cursoRepository.findOne({
                where: { id: Number(curso_id) },
            });
            if (!existeCurso) {
                return res.status(404).json({ mensaje: "El curso no existe." });
            }
            const inscripto = yield cursoEstudianteRepository.findOne({
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
            yield cursoEstudianteRepository.save(nuevaInscripcion);
        }));
        res.redirect("/CursosEstudiantes/listarInscripciones");
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.inscribir = inscribir;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { estudiante_id, curso_id } = req.params;
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(cursoEstudianteModel_1.CursoEstudiante);
        const cursoEstudiante = yield cursoEstudianteRepository.findOne({
            where: {
                estudiante_id: Number(estudiante_id),
                curso_id: Number(curso_id),
            },
            relations: ["estudiante", "curso"],
        });
        if (!cursoEstudiante) {
            return res.status(404).send("Inscripción no encontrada");
        }
        const estudianteRepository = conexion_1.AppDataSource.getRepository(estudianteModel_1.Estudiante);
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const estudiantes = yield estudianteRepository.find();
        const cursos = yield cursoRepository.find();
        res.render("modificarInscripcion", {
            pagina: "Modificar Inscripción",
            cursoEstudiante,
            estudiantes,
            cursos,
        });
    }
    catch (error) {
        res.status(500).send("Error al cargar el formulario de modificación");
    }
});
exports.modificar = modificar;
const actualizarInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { estudiante_id, curso_id } = req.params;
        const { nota } = req.body;
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(cursoEstudianteModel_1.CursoEstudiante);
        const cursoEstudiante = yield cursoEstudianteRepository.findOne({
            where: {
                estudiante_id: Number(estudiante_id),
                curso_id: Number(curso_id),
            },
        });
        if (!cursoEstudiante) {
            return res.status(404).send("Inscripción no encontrada");
        }
        cursoEstudiante.nota = nota;
        yield cursoEstudianteRepository.save(cursoEstudiante);
        res.redirect("/CursosEstudiantes/listarInscripciones");
    }
    catch (error) {
        res.status(500).send("Error al actualizar la inscripción");
    }
});
exports.actualizarInscripcion = actualizarInscripcion;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estudiante_id, curso_id } = req.params;
    if (!estudiante_id || !curso_id) {
        return res.status(400).json({ mensaje: "Faltan parámetros" });
    }
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoEstudianteRepository = transactionalEntityManager.getRepository(cursoEstudianteModel_1.CursoEstudiante);
            const inscripcion = yield cursoEstudianteRepository.findOne({
                where: {
                    estudiante_id: Number(estudiante_id),
                    curso_id: Number(curso_id),
                },
            });
            if (!inscripcion) {
                throw new Error("La inscripción no existe");
            }
            yield cursoEstudianteRepository.remove(inscripcion);
            return res.json({ mensaje: "Inscripción eliminada" });
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ mensaje: err.message });
        }
    }
});
exports.eliminar = eliminar;
