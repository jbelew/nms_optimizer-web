# Política de privacidad de NMS Optimizer: tus datos y seguridad

**Última actualización:** 16 de marzo de 2026

Tu privacidad es importante para nosotros. Esta Política de privacidad explica cómo **NMS Optimizer** («nosotros», «nos» o «nuestro») recopila, utiliza y protege tu información cuando usas nuestra aplicación web y su motor de optimización asociado.

## 1. Recopilación de información

NMS Optimizer está diseñado como una herramienta centrada en la privacidad.

- **Sin información personal:** No recopilamos información de identificación personal (PII), como tu nombre, dirección de correo electrónico o dirección postal. No existe ningún sistema de inicio de sesión ni de cuentas de usuario.
- **Almacenamiento local:** La aplicación utiliza el **LocalStorage** de tu navegador para guardar tus preferencias y el estado de tus diseños. Estos datos permanecen en tu dispositivo y ni se transmiten a nuestros servidores ni los almacenamos nosotros.
- **Datos de uso anónimos:** Utilizamos **Google Analytics** para recopilar estadísticas de uso anónimas (como páginas vistas e interacción con funciones). Estos datos se agregan y no te identifican personalmente.

## 2. Infraestructura técnica y supervisión

Para garantizar que la aplicación sea segura, rápida y esté libre de errores, utilizamos los siguientes proveedores de servicios:

- **Cloudflare:** Nuestra aplicación se aloja y protege mediante Cloudflare, que procesa direcciones IP y metadatos técnicos para ofrecer protección frente a ataques DDoS y optimizar la entrega de contenidos.
- **Heroku (Salesforce):** Nuestra API interna de optimización está alojada en Heroku. Heroku procesa los datos técnicos de las solicitudes y mantiene registros estándar del servidor (por ejemplo, direcciones IP y marcas temporales) para garantizar que la API siga siendo operativa y segura.
- **Sentry:** Utilizamos Sentry para la supervisión de errores. Si la aplicación sufre un fallo, se envía un informe técnico a Sentry. Estos informes están configurados para excluir tus datos personales y se emplean exclusivamente con fines de depuración.

## 3. Tratamiento de datos (API interna)

NMS Optimizer se comunica con una API dedicada, desarrollada por nosotros y alojada en Heroku, para realizar los cálculos de distribución tecnológica.

- **Finalidad:** Cuando ejecutas una optimización, los parámetros técnicos de la tecnología y la disposición de tu cuadrícula se envían a esta API.
- **Privacidad:** Esta comunicación es estrictamente funcional. Con estas solicitudes no se envían datos personales ni identificadores persistentes de usuario. Los datos se procesan en memoria y no se guardan en ninguna base de datos.

## 4. Seguridad de los datos

Aplicamos medidas de seguridad razonables, incluido el **cifrado SSL/TLS** en todos los datos en tránsito (a través de Cloudflare y Heroku), para proteger la integridad de la aplicación.

## 5. Tu control

Dado que el estado de la aplicación se guarda localmente:

- **Para borrar tus datos:** Basta con borrar los «Datos del sitio» o la caché de tu navegador para este dominio.
- **Para desactivar el seguimiento:** Puedes usar extensiones de navegador (como uBlock Origin) para impedir la recopilación de datos de uso sin afectar al funcionamiento de la aplicación.

## 6. Cambios en esta política

Podemos actualizar nuestra Política de privacidad ocasionalmente. Te informaremos de cualquier cambio actualizando la fecha de «Última actualización» en la parte superior de esta página.

## 7. Contacto

Si tienes alguna pregunta sobre esta Política de privacidad, puedes contactar con nosotros a través de [GitHub Issues](https://github.com/jbelew/nms_optimizer-web/issues).
