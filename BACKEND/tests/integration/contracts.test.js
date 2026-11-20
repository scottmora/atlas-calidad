const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../../src/db", () => ({ pool: { query: jest.fn() } }));
const { pool } = require("../../src/db");
const app = require("../../src/app");

const SECRET = process.env.JWT_SECRET;
const tokenEditor = jwt.sign(
  { usuarioId: 2, nombreUsuario: "editor", empresaId: 1, rolNombre: "editor" },
  SECRET
);
const tokenAdministrador = jwt.sign(
  { usuarioId: 1, nombreUsuario: "admin", empresaId: 1, rolNombre: "administrador" },
  SECRET
);

beforeEach(() => pool.query.mockReset());

describe("Errores en rutas de contratos", () => {
  test.each([
    ["/contratos", "Error al listar contratos"],
    ["/contratos/estados", "Error al obtener contratos por estado"],
    ["/contratos/dashboard", "Error al obtener estadísticas"],
  ])("responde 500 si falla la consulta en %s", async (path, message) => {
    pool.query.mockRejectedValueOnce(new Error("conexión perdida"));
    const res = await request(app)
      .get(path)
      .set("Authorization", `Bearer ${tokenAdministrador}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: message,
      glosa: "conexión perdida",
    });
  });
});

describe("Autenticación de rutas de contratos", () => {
  test.each([
    ["get", "/contratos"],
    ["get", "/contratos/estados"],
    ["get", "/contratos/dashboard"],
    ["put", "/contratos/1"],
    ["delete", "/contratos/1/file/1"],
    ["post", "/contratos/1/share"],
    ["delete", "/contratos/1/share"],
    ["get", "/contratos/1/share"],
  ])("401 sin token en %s %s", async (method, path) => {
    let call = request(app)[method](path);
    if (method === "put") call = call.send({});
    const res = await call;

    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("DELETE /contratos/:id", () => {
  test("401 sin token y no elimina datos", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/contratos/7");

    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("403 si el token pertenece a un editor y no elimina datos", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete("/contratos/7")
      .set("Authorization", `Bearer ${tokenEditor}`);

    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("200 si el token pertenece al administrador", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete("/contratos/7")
      .set("Authorization", `Bearer ${tokenAdministrador}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });
});
