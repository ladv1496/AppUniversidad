"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const estudianteRouter_1 = __importDefault(require("./routes/estudianteRouter"));
const profesorRouter_1 = __importDefault(require("./routes/profesorRouter"));
const inscripcionRouter_1 = __importDefault(require("./routes/inscripcionRouter"));
const cursoRouter_1 = __importDefault(require("./routes/cursoRouter"));
const method_override_1 = __importDefault(require("method-override"));
const app = (0, express_1.default)();
app.set("view engine", "pug");
app.set("views", path_1.default.join(__dirname, "./views"));
app.use(express_1.default.static("public"));
app.use((0, method_override_1.default)("_method"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    console.log(__dirname);
    return res.render("index", {
        pagina: "App Univerdsidad",
    });
});
app.use("/estudiantes", estudianteRouter_1.default);
app.use("/profesores", profesorRouter_1.default);
app.use("/cursos", cursoRouter_1.default);
app.use("/CursosEstudiantes", inscripcionRouter_1.default);
app.post("/CursosEstudiantes/actualizarInscripcion/:idEstudiante/:idCurso", (req, res) => { });
exports.default = app;
