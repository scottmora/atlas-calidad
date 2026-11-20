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

describe("Descarga de archivos de contratos", () => {
  test.each([
    ["/contratos/7/file/2", [2, "7"]],
    ["/contratos/7/file", ["7"]],
  ])("sirve el archivo solicitado en %s", async (path, params) => {
    pool.query.mockResolvedValueOnce({
      rows: [{ document: Buffer.from("pdf-data"), nombre_archivo: "test.pdf" }],
    });
    const res = await request(app).get(path);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toBe('inline; filename="test.pdf"');
    expect(res.body.toString()).toBe("pdf-data");
    expect(pool.query.mock.calls[0][1]).toEqual(params);
  });

  test("404 si el archivo no existe", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/contratos/7/file/2");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Documento no encontrado" });
  });

  test.each(["/contratos/7/file/2", "/contratos/7/file"])(
    "500 si falla la lectura en %s",
    async (path) => {
      pool.query.mockRejectedValueOnce(new Error("almacenamiento no disponible"));
      const res = await request(app).get(path);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Error al obtener archivo",
        glosa: "almacenamiento no disponible",
      });
    }
  );
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
