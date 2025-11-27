import { Role } from "@src/interfaces/user.interface";

export const PATHS = [
  { name: "Inicio", path: "/", public: false, role: [Role.ADMIN] },
  { name: "Usuarios", path: "/users", public: false, role: [Role.ADMIN] },
  { name: "Estudiantes", path: "/students", public: false, role: [Role.ADMIN] },
  { name: "Profesores", path: "/teachers", public: false, role: [Role.ADMIN] },
  { name: "Carreras", path: "/careers", public: false, role: [Role.ADMIN] },
  { name: "Cursos", path: "/courses", public: false, role: [Role.ADMIN] },
  { name: "Asistencias", path: "/attendance", public: false, role: [Role.ADMIN, Role.TEACHER] },
  { name: "Inicio de sesión", path: "/auth/login", public: true, role: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
  { name: "Registro", path: "/auth/registration", public: true, role: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
  { name: "Portal de Estudiantes", path: "/portal", public: false, role: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
  { name: "No encontrado", path: "/404", public: true, role: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
  { name: "Error interno", path: "/500", public: true, role: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
  { name: "Acceso no autorizado", path: "/401", public: true, role: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
];