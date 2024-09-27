import dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";
import { createConnection } from "mysql2/promise";
import { Estudiante } from "../models/estudianteModel";
import { Curso } from "../models/cursoModel";
import { Profesor } from "../models/profesorModel";
import { CursoEstudiante } from "../models/cursoEstudianteModel";

dotenv.config();

const port: number = process.env.BD_PORT
  ? parseInt(process.env.BD_PORT, 10)
  : 3306;
async function createDatabaseIfNotExists() {
  const connection = await createConnection({
    host: process.env.DB_HOST,
    port,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
  } catch (error) {
    console.error("Error creando la base de datos:", error);
  } finally {
    connection.end();
  }
}

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Profesor, Estudiante, Curso, CursoEstudiante],
  synchronize: true,
  logging: true,
});

export async function initializeDatabase() {
  await createDatabaseIfNotExists();
  await AppDataSource.initialize();
}
