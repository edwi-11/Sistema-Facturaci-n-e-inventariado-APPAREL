# Plan de Pruebas - Sistema Apparel

## 1. Propósito y Alcance
[span_0](start_span)[span_1](start_span)Este documento define la estrategia de pruebas para el sistema integrador "Apparel" (Facturación e Inventario)[span_0](end_span)[span_1](end_span). [span_2](start_span)[span_3](start_span)El objetivo es asegurar que las funcionalidades críticas operen de forma correcta según el modelo ISO 25010[span_2](end_span)[span_3](end_span).
* **[span_4](start_span)[span_5](start_span)Incluido:** Autenticación de usuarios, gestión del catálogo de ropa, y validación de stock en el módulo de facturación[span_4](end_span)[span_5](end_span).
* **Excluido:** Devoluciones y reembolsos (módulo descartado por reglas de negocio del sistema).

## 2. Herramientas de Trabajo Seleccionadas
* **[span_6](start_span)[span_7](start_span)Backend (C#):** xUnit para pruebas unitarias automatizadas de lógica de negocio[span_6](end_span)[span_7](end_span).
* **[span_8](start_span)[span_9](start_span)APIs e Integración:** Postman / Swagger para verificar endpoints REST y persistencia en SQL Server[span_8](end_span)[span_9](end_span).
* **[span_10](start_span)Frontend:** DevTools del Navegador (Consola y Red) para validaciones manuales de UI[span_10](end_span).
* **[span_11](start_span)[span_12](start_span)Gestión:** GitHub para el repositorio documental[span_11](end_span)[span_12](end_span).

## 3. Matriz de Relación (Problema - Métrica - Tipo de Prueba - Atributo de Calidad ISO 25010)
| Problema Potencial | Métrica de Calidad | Tipo de Prueba | Atributo de Calidad (ISO 25010) |
| Registro de venta con stock insuficiente | Tasa de error en transacciones | Funcional / Unitaria | Confiabilidad |
| API tarda demasiado en retornar prendas | Tiempo de respuesta (ms) | No funcional / Rendimiento | Eficiencia de desempeño |
| Intento de inyección SQL en el buscador | Vulnerabilidades críticas detectadas | Seguridad | Seguridad / Integridad |
