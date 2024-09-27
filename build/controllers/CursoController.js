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
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.consultarTodos = exports.validar = void 0;
const express_validator_1 = require("express-validator");
const conexion_1 = require("../db/conexion");
const cursoModel_1 = require("../models/cursoModel");
const profesorModel_1 = require("../models/profesorModel");
const cursoEstudianteModel_1 = require("../models/cursoEstudianteModel");
var cursos;
const validar = () => [
    (0, express_validator_1.check)("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ min: 3 })
        .withMessage("El Nombre debe tener al menos 3 caracteres"),
    (0, express_validator_1.check)("descripcion")
        .notEmpty()
        .withMessage("La descripción es obligatoria")
        .isLength({ min: 3 })
        .withMessage("La Descripción debe tener al menos 3 caracteres"),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            return res.render("creaCursos", {
                pagina: "Crear Curso",
                errores: errores.array(),
            });
        }
        next();
    },
];
exports.validar = validar;
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        cursos = yield cursoRepository.find({
            relations: ["profesor"],
        });
        res.render("listarCursos", {
            pagina: "Lista de Cursos",
            cursos,
        });
        console.log(cursos);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarTodos = consultarTodos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        throw new Error("ID inválido, debe ser un número");
    }
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const curso = yield cursoRepository.findOne({
            where: { id: idNumber },
        });
        if (curso) {
            return curso;
        }
        else {
            return null;
        }
    }
    catch (err) {
        if (err instanceof Error) {
            throw err;
        }
        else {
            throw new Error("Error desconocido");
        }
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        const profesorRepository = conexion_1.AppDataSource.getRepository(profesorModel_1.Profesor);
        const profesores = yield profesorRepository.find();
        return res.render("creaCursos", {
            pagina: "Crear Curso",
            profesores,
            cursos,
        });
    }
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const profesorRepository = transactionalEntityManager.getRepository(profesorModel_1.Profesor);
            const cursoRepository = transactionalEntityManager.getRepository(cursoModel_1.Curso);
            const existeProfesor = yield profesorRepository.findOne({
                where: { id: Number(profesor_id) },
            });
            if (!existeProfesor) {
                throw new Error("El profesor no existe.");
            }
            const existeCurso = yield cursoRepository.findOne({
                where: [{ nombre }, { descripcion }],
            });
            if (existeCurso) {
                throw new Error("El curso ya existe.");
            }
            const nuevoCurso = cursoRepository.create({
                nombre,
                descripcion,
                profesor: existeProfesor,
            });
            yield cursoRepository.save(nuevoCurso);
        }));
        res.redirect("/cursos/listarCursos");
    }
    catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.insertar = insertar;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
        const curso = yield cursoRepository.findOne({
            where: { id: parseInt(id) },
        });
        if (!curso) {
            return res.status(404).json({ mensaje: "El curso no existe" });
        }
        const profesorRepository = conexion_1.AppDataSource.getRepository(profesorModel_1.Profesor);
        const profesor = yield profesorRepository.findOne({
            where: { id: profesor_id },
        });
        if (!profesor) {
            return res.status(400).json({ mensaje: "El profesor no existe" });
        }
        cursoRepository.merge(curso, { nombre, descripcion, profesor });
        yield cursoRepository.save(curso);
        return res.redirect("/cursos/listarCursos");
    }
    catch (error) {
        console.error("Error al modificar el curso:", error);
        return res.status(500).send("Error del servidor");
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params);
    const { id } = req.params;
    console.log(`ID Curso: ${id}`);
    if (!id) {
        return res.status(400).json({ mensaje: "Faltan parámetros" });
    }
    try {
        console.log(`ID recibido para eliminar: ${id} `);
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoEstudianteRepository = transactionalEntityManager.getRepository(cursoEstudianteModel_1.CursoEstudiante); //estudiantes cursando
            const cursoRepository = transactionalEntityManager.getRepository(cursoModel_1.Curso);
            const estudiantesAsignados = yield cursoEstudianteRepository.count({
                where: { curso: { id: Number(id) } },
            });
            console.log(`Número de estudiantes cursando el curso: ${estudiantesAsignados}`);
            if (estudiantesAsignados > 0) {
                throw new Error("Estudiante cursando materia, no se puede eliminar");
            }
            const curso = yield cursoRepository.findOne({
                where: { id: Number(id) },
            });
            if (!curso) {
                throw new Error("El curso no existe");
            }
            const deleteResult = yield cursoRepository.delete(id);
            console.log(`Resultado de la eliminación: ${JSON.stringify(deleteResult)}`);
            if (deleteResult.affected === 1) {
                return res.json({ mensaje: "Curso eliminado" });
            }
            else {
                throw new Error("Curso no encontrado");
            }
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        }
        else {
            res.status(400).json({ mensaje: "Error" });
        }
    }
});
exports.eliminar = eliminar;
