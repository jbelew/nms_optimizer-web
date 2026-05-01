# Política de Privacidad del NMS Optimizer: Tus Datos y Seguridad

**Última Actualización:** 16 de marzo de 2026

Tu privacidad es importante para nosotros. Esta Política de Privacidad explica cómo el **NMS Optimizer** ("nosotros", "nos" o "nuestro") recopila, utiliza y protege tu información cuando utilizas nuestra aplicación web y su motor de optimización asociado.

---

## 1. Recopilación de Información

El NMS Optimizer está diseñado para ser una herramienta centrada en la privacidad.

- **Sin Información Personal:** No recopilamos información de identificación personal (PII), como tu nombre, dirección de correo electrónico o dirección física. No existe un sistema de inicio de sesión o de cuentas.
- **Almacenamiento Local:** La aplicación utiliza el **LocalStorage** de tu navegador para guardar tus preferencias y el estado de tus diseños. Estos datos permanecen en tu dispositivo y no se transmiten a nuestros servidores ni son almacenados por nosotros.
- **Datos de Uso Anónimos:** Utilizamos **Google Analytics** para recopilar estadísticas de uso anónimas (como visitas a páginas e interacción con funciones). Estos datos se agregan y no te identifican personalmente.

## 2. Infraestructura Técnica y Supervisión

Para garantizar que la aplicación sea segura, rápida y esté libre de errores, utilizamos los siguientes proveedores de servicios:

- **Cloudflare:** Nuestra aplicación está alojada y protegida a través de Cloudflare. Ellos procesan direcciones IP y metadatos técnicos para proporcionar protección contra DDoS y optimizar la entrega de contenido.
- **Heroku (Salesforce):** Nuestra API interna de optimización está alojada en Heroku. Heroku procesa los datos técnicos de las solicitudes y mantiene los registros estándar del servidor (por ejemplo, direcciones IP y marcas de tiempo) para garantizar que la API siga siendo operativa y segura.
- **Sentry:** Utilizamos Sentry para el control de errores. Si la aplicación encuentra un error, se envía un informe técnico a Sentry. Estos informes están configurados para excluir tus datos personales y se utilizan estrictamente para la depuración.

## 3. Procesamiento de Datos (API Interna)

El NMS Optimizer interactúa con una API dedicada, creada por nosotros y alojada en Heroku, para realizar los cálculos de diseño tecnológico.

- **Propósito:** Cuando realizas una optimización, los parámetros técnicos de la tecnología y el diseño de tu cuadrícula se envían a esta API.
- **Privacidad:** Esta interacción es estrictamente funcional. No se envían datos personales ni identificadores de usuario persistentes con estas solicitudes. Los datos se procesan en memoria y no se guardan en una base de datos.

## 4. Seguridad de los Datos

Implementamos medidas de seguridad razonables, incluido el **cifrado SSL/TLS** en todos los datos en tránsito (a través de Cloudflare y Heroku), para proteger la integridad de la aplicación.

## 5. Tu Control

Dado que el estado de tu aplicación se almacena localmente:

- **Para Borrar tus Datos:** Simplemente borra los "Datos del sitio" o la caché de tu navegador para este dominio.
- **Para Excluirte del Seguimiento:** Puedes utilizar extensiones de navegador (como uBlock Origin) para evitar la recopilación de datos de uso sin afectar a la funcionalidad de la aplicación.

## 6. Cambios en Esta Política

Es posible que actualicemos nuestra Política de Privacidad de vez en cuando. Te notificaremos de cualquier cambio actualizando la fecha de "Última Actualización" en la parte superior de esta página.

## 7. Contacto

Si tienes alguna pregunta sobre esta Política de Privacidad, puedes ponerte en contacto con nosotros a través de [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).
