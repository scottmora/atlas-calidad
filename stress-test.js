import http from "k6/http";
import { check, sleep } from "k6";

const API = __ENV.API_URL || "http://localhost:4451";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "30s", target: 50 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export function setup() {
  const response = http.post(
    `${API}/autenticacion/login`,
    JSON.stringify({ nombre_usuario: "admin", password: "admin" }),
    { headers: { "Content-Type": "application/json" } }
  );
  const token = response.json("token");

  if (response.status !== 200 || !token) {
    throw new Error(`Login de prueba fallido (HTTP ${response.status})`);
  }

  return { token };
}

export default function ({ token }) {
  const response = http.get(`${API}/clientes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(response, {
    "listar clientes: status 200": (res) => res.status === 200,
    "listar clientes: devuelve un arreglo": (res) =>
      Array.isArray(res.json()),
  });

  sleep(1);
}
