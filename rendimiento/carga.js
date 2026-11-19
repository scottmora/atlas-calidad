import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4451";
const PERFIL = __ENV.PERFIL || "humo";

const perfiles = {
  humo: [
    { duration: "10s", target: 5 },
    { duration: "20s", target: 5 },
    { duration: "5s", target: 0 },
  ],
  carga: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
};

export const options = {
  stages: perfiles[PERFIL],
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/autenticacion/login`,
    JSON.stringify({ nombre_usuario: "admin", password: "admin" }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(res, { "login correcto": (r) => r.status === 200 });
  return { token: res.json("token") };
}

export default function (datos) {
  const params = { headers: { Authorization: `Bearer ${datos.token}` } };

  const clientes = http.get(`${BASE_URL}/clientes`, params);
  check(clientes, { "listar clientes responde 200": (r) => r.status === 200 });

  const contratos = http.get(`${BASE_URL}/contratos`, params);
  check(contratos, { "listar contratos responde 200": (r) => r.status === 200 });

  sleep(1);
}
