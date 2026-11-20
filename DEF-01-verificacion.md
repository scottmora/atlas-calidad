# Verificación de DEF-01

**Estado:** Verificado  
**Fecha:** 2026-11-19

## Evidencia de prueba

Comando ejecutado desde `CodigoFuenteETA/BACKEND`:

```powershell
npm run test:integration
```

Resultado: **3 suites aprobadas; 12 pruebas aprobadas; 0 fallidas**.

La guía esperaba 7 pruebas, pero la versión actual del backend ejecuta 12. Entre ellas, `tests/integration/clients.test.js` verifica que un editor recibe HTTP 403 al eliminar un cliente y que un administrador puede eliminarlo. La validación de rol está en `src/routes/clients.js`, inmediatamente después de la respuesta 401.

## Capturas

Las capturas del antes y del después están pendientes de guardarse en la carpeta indicada. No se modificó la guía de actividad original.
