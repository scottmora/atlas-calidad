const { calcularEstadoContrato } = require("../../src/utils/estadoContrato");

const HOY = new Date("2026-06-15");

describe("calcularEstadoContrato (RF-5.4)", () => {
  test("Camino 1: faltan fechas -> error", () => {
    expect(() => calcularEstadoContrato(null, "2026-12-31", HOY)).toThrow("obligatorias");
  });
  test("Camino 2: fecha inválida -> error", () => {
    expect(() => calcularEstadoContrato("hola", "2026-12-31", HOY)).toThrow("inválido");
  });
  test("Camino 3: término anterior al inicio -> error", () => {
    expect(() => calcularEstadoContrato("2026-12-31", "2026-01-01", HOY)).toThrow("anterior");
  });
  test("Camino 4: contrato pendiente", () => {
    expect(calcularEstadoContrato("2026-07-01", "2026-12-31", HOY)).toBe("pendiente");
  });
  test("Camino 5: contrato expirado", () => {
    expect(calcularEstadoContrato("2026-01-01", "2026-06-01", HOY)).toBe("expirado");
  });
  test("Camino 6: contrato por vencer", () => {
    expect(calcularEstadoContrato("2026-01-01", "2026-07-01", HOY)).toBe("por_vencer");
  });
  test("Camino 7: contrato activo", () => {
    expect(calcularEstadoContrato("2026-01-01", "2026-12-31", HOY)).toBe("activo");
  });
});
