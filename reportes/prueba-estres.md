# Resultado de la prueba de estrés

| Prueba | Usuarios máx. | p95 (ms) | Tasa de error | Solicitudes/s | ¿Cumple umbrales? | CPU máx. API |
|---|---:|---:|---:|---:|---|---:|
| Estrés (reto) | 50 | 9,68 | 0,00 % | 33,74 | Sí | 36,06 % |

**Conclusión:** se cumplieron ambos umbrales: p95 menor a 500 ms y tasa de error menor a 1 %. La medición se realizó el 4 de noviembre de 2026 sobre `GET /clientes`, con autenticación, durante 2 min 30 s: subida a 20 usuarios en 30 s, subida a 50 en los siguientes 30 s, permanencia en 50 durante 1 min y descenso durante 30 s. La CPU máxima corresponde al contenedor del API, muestreada aproximadamente cada segundo.

Para repetirla desde PowerShell, con Atlas encendido:

```powershell
docker run --rm --add-host=host.docker.internal:host-gateway `
  -v "${PWD}:/scripts" `
  -e API_URL=http://host.docker.internal:4451 `
  grafana/k6 run /scripts/stress-test.js
```
