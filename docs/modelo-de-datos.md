# Mente Unida — campos para la base de datos

Este documento lista lo que el proyecto ya pide en pantalla y cómo guardarlo cuando se conecte una base de datos. Hoy no hay servidor ni base de datos. El registro y el inicio de sesión no envían nada. La agenda, los pacientes del portal y El Escuchadero se guardan solo en el navegador, en `sessionStorage`, y se pierden al cerrar la pestaña.

Claves actuales del navegador, en `src/portal/clinic.tsx`:

| Clave | Qué guarda |
| --- | --- |
| `mu-patients` | Pacientes de demostración y su vínculo con un psicólogo |
| `mu-appointments` | Citas del calendario |
| `mu-messages` | Mensajes de El Escuchadero |

La contraseña de confirmación, el texto “Recordar mi cuenta” y el micrófono o la cámara de la sala no se persisten.

## Reglas que la base debe respetar

- Si un psicólogo agenda la cita, el paciente queda vinculado a ese psicólogo (`origen = psicologo`). En agendar solo ve a esa persona. Otro psicólogo aparece si el actual lo transfiere.
- Si el paciente saca su propia cita y aún no tiene vínculo, se le muestran los psicólogos cuyo enfoque coincide con sus motivos. Al registrar la cita, el vínculo queda con `origen = paciente`.
- Un horario no se puede repetir para el mismo psicólogo, la misma fecha y la misma hora.
- El traslado mueve las citas de hoy en adelante al nuevo psicólogo y deja el origen en `psicologo`.
- La contraseña se guarda cifrada. No se guarda la confirmación.
- Los archivos de acreditación se guardan en almacenamiento de archivos. En la base solo va la ruta, el nombre y el tipo.

Horarios que usa el calendario: `09:00`, `11:30`, `14:00`, `16:00`.  
Modalidad: `virtual` o `presencial`.  
Estado de la cita en el código: `confirmada` o `pendiente`. Al agendar, la pantalla siempre deja la cita en `confirmada`.

## Usuarios

Una sola tabla de acceso. El perfil distingue paciente y psicólogo. El inicio de sesión pide correo y contraseña. El psicólogo, además, pide un número único registrado con ese correo.

| Campo | Tipo | Obligatorio | Origen en la pantalla |
| --- | --- | --- | --- |
| `id` | uuid | sí | lo genera la base |
| `rol` | `paciente` \| `psicologo` | sí | pestaña de registro o de login |
| `correo` | texto, único | sí | Correo electrónico |
| `contrasena_hash` | texto | sí | Contraseña. Mínimo 8 caracteres |
| `numero_unico` | texto, único, solo psicólogo | sí para psicólogo | Número único del login. El registro todavía no lo pide: hay que generarlo al aprobar al profesional y guardarlo junto al correo |
| `acepto_terminos` | booleano | sí | Casilla de términos de la plataforma |
| `acepto_terminos_en` | fecha y hora | sí | momento en que marcó la casilla |
| `recordar_sesion` | booleano | no | “Recordar mi cuenta en este dispositivo”. Es preferencia del navegador, no un dato clínico |
| `creado_en` | fecha y hora | sí | al completar el registro |
| `actualizado_en` | fecha y hora | sí | cada cambio |

### Recuperación de contraseña

La pantalla ofrece correo (enlace temporal) o SMS (código de 6 dígitos). Hoy el botón solo muestra un aviso y no envía nada.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | |
| `usuario_id` | uuid | |
| `canal` | `correo` \| `sms` | |
| `destino` | texto | correo o celular al que se envió |
| `token_hash` | texto | enlace o código, nunca en claro |
| `expira_en` | fecha y hora | |
| `usado_en` | fecha y hora, nulo | |

## Pacientes

Paso 1, información básica:

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `id` | uuid | sí |
| `usuario_id` | uuid | sí |
| `nombres` | texto | sí |
| `apellidos` | texto | sí |
| `numero_identificacion` | texto | sí |
| `fecha_nacimiento` | fecha | sí |

Paso 2, contacto:

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `celular` | texto | sí |
| `correo` | texto | sí. Puede ser el mismo de `usuarios.correo` |
| `direccion` | texto | sí. Línea ya armada, por ejemplo `Carrera 43A / 18-45, El Poblado, Medellín, Antioquia, Colombia` |

La dirección sale de un modal. Conviene guardar también las partes, porque el formulario las pide por separado y luego las une en un solo texto:

| Campo | Valores |
| --- | --- |
| `pais` | texto. El modal arranca en Colombia |
| `departamento` | texto |
| `ciudad` | texto |
| `barrio` | texto |
| `tipo_via` | `Carrera`, `Calle` o `Avenida` |
| `numero_principal` | texto |
| `numero_secundario` | texto. Se muestra como `numero_principal / numero_secundario` |

Paso 3, acompañante o contacto de emergencia. Una fila por paciente:

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `id` | uuid | sí |
| `paciente_id` | uuid | sí |
| `nombre` | texto | sí |
| `telefono` | texto | sí |
| `correo` | texto | sí |
| `parentesco` | `Padre`, `Madre`, `Hermano/a`, `Tío/a` | sí |
| `fecha_nacimiento` | fecha | sí |

Motivos de consulta. En el portal de demostración son una lista (`Ansiedad`, `Estrés`, `Familia`). El registro todavía no los pide. Hacen falta para filtrar psicólogos cuando el paciente agenda solo.

| Campo | Tipo |
| --- | --- |
| `paciente_id` | uuid |
| `motivo` | texto |

## Psicólogos

Paso 1 y 2, los mismos datos básicos y de contacto del paciente, sin fecha de nacimiento:

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `id` | uuid | sí |
| `usuario_id` | uuid | sí |
| `nombres` | texto | sí |
| `apellidos` | texto | sí |
| `numero_identificacion` | texto | sí |
| `celular` | texto | sí |
| `correo` | texto | sí |
| `direccion` y partes de dirección | igual que el paciente | sí |
| `enfoque` | texto | lo usa el directorio. Ejemplos: Terapia sistémica, Acompañamiento emocional, Mindfulness |
| `cargo` | texto | ejemplo: Psicólogo clínico |
| `foto` | ruta de archivo | |
| `estado_verificacion` | `pendiente` \| `aprobado` \| `rechazado` | el registro dice que se notificará cuando termine la verificación |

Enfoques o motivos que atiende. Sirven para emparejar con los motivos del paciente:

| Campo | Tipo |
| --- | --- |
| `psicologo_id` | uuid |
| `tema` | texto. Ejemplos del portal: Ansiedad, Estrés, Familia, Adultos, Pareja, Burnout, Regulación |

Paso 3, acreditación. Cada fila es un archivo. PDF, JPG o PNG, máximo 10 MB. El formulario solo conserva el nombre del archivo.

| `tipo` | Etiqueta en pantalla |
| --- | --- |
| `universidad` | Universidad o institución de formación |
| `experiencia` | Experiencia profesional |
| `tarjeta_profesional` | Número de tarjeta profesional |
| `rethus` | Registro en RETHUS |
| `estudios` | Especializaciones y estudios complementarios |
| `diplomas` | Certificados y diplomas |
| `identidad` | Documentos que acrediten su identidad y formación |

| Campo | Tipo |
| --- | --- |
| `id` | uuid |
| `psicologo_id` | uuid |
| `tipo` | uno de los valores de arriba |
| `nombre_archivo` | texto |
| `ruta` | texto |
| `peso_bytes` | número |
| `subido_en` | fecha y hora |

En el directorio de demostración también aparece la tarjeta como texto (`TP-108429-COL`). Si ese número debe verse en el perfil, hace falta un campo de texto `tarjeta_profesional` además del archivo.

## Vínculo paciente–psicólogo

Un paciente tiene un vínculo activo.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `paciente_id` | uuid | único mientras el vínculo esté activo |
| `psicologo_id` | uuid | |
| `origen` | `paciente` \| `psicologo` | `psicologo` bloquea agendar con otros. `paciente` deja el proceso con quien eligió, sin ese bloqueo exclusivo |
| `desde` | fecha y hora | |

Historial de traslados. La pantalla “Pasar a otro psicólogo” hoy reemplaza el vínculo y no deja rastro.

| Campo | Tipo |
| --- | --- |
| `id` | uuid |
| `paciente_id` | uuid |
| `psicologo_anterior_id` | uuid |
| `psicologo_nuevo_id` | uuid |
| `trasladado_por` | uuid del psicólogo que confirmó |
| `creado_en` | fecha y hora |

## Calendario y citas

El mes que pinta la pantalla es octubre de 2026. La fecha real de “hoy” sale del reloj del dispositivo. Cada cita:

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `id` | uuid | sí | |
| `paciente_id` | uuid | sí | |
| `psicologo_id` | uuid | sí | |
| `fecha` | fecha `AAAA-MM-DD` | sí | |
| `hora` | hora `HH:MM` | sí | uno de los cuatro horarios |
| `modalidad` | `virtual` \| `presencial` | sí | |
| `estado` | `confirmada` \| `pendiente` \| `cancelada` \| `realizada` | sí | el portal usa las dos primeras. Cancelada y realizada sirven para no borrar el historial |
| `agendada_por` | `paciente` \| `psicologo` | sí | |
| `creado_en` | fecha y hora | sí | |

Índice único: `psicologo_id + fecha + hora` mientras el estado no sea `cancelada`.

Al transferir, las citas con `fecha` mayor o igual a hoy cambian de `psicologo_id`. Las anteriores se quedan con el psicólogo original.

## Recordatorios

La interfaz todavía no tiene pantalla de recordatorios. Esta tabla es la que debe existir para avisar una cita ya guardada, por el correo o el celular del registro, o por el SMS que ya ofrece la recuperación de contraseña.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | |
| `cita_id` | uuid | la cita del calendario |
| `usuario_id` | uuid | paciente, psicólogo o ambos. Una fila por destinatario |
| `canal` | `correo` \| `sms` | |
| `destino` | texto | correo o celular en el momento de programar |
| `anticipacion_minutos` | número | por ejemplo 1440 (un día) y 60 (una hora) |
| `enviar_en` | fecha y hora | `fecha` y `hora` de la cita menos la anticipación |
| `estado` | `pendiente` \| `enviado` \| `fallido` \| `cancelado` | si la cita se cancela o se transfiere, los pendientes pasan a `cancelado` y se crean otros con el nuevo horario o psicólogo |
| `enviado_en` | fecha y hora, nulo | |
| `detalle_error` | texto, nulo | |

Al crear una cita confirmada se insertan los recordatorios pendientes. No hace falta que el usuario los escriba en el formulario mientras no exista esa opción en pantalla.

## El Escuchadero

Hoy hay un solo hilo de mensajes, sin paciente ni psicólogo en cada mensaje. Para varias conversaciones, cada mensaje necesita la conversación.

Conversación:

| Campo | Tipo |
| --- | --- |
| `id` | uuid |
| `paciente_id` | uuid |
| `psicologo_id` | uuid |
| `cita_id` | uuid, nulo. La conversación es antes de la cita; puede enlazarse cuando ya exista |
| `creado_en` | fecha y hora |

Mensaje:

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | |
| `conversacion_id` | uuid | |
| `autor` | `paciente` \| `psicologo` | |
| `texto` | texto | |
| `enviado_en` | fecha y hora | la pantalla solo muestra `HH:MM` |

## Sesión virtual

El micrófono, la cámara y “Salir de la sala” son estado de esa visita. No se guardan. Lo que sí conviene guardar, ligado a la cita virtual:

| Campo | Tipo |
| --- | --- |
| `id` | uuid |
| `cita_id` | uuid. Solo si `modalidad = virtual` |
| `sala` | texto. Identificador de la videollamada |
| `inicio` | fecha y hora, nulo |
| `fin` | fecha y hora, nulo |
| `paciente_entro_en` | fecha y hora, nulo |
| `psicologo_entro_en` | fecha y hora, nulo |

## Qué no va a la base

| Dato de pantalla | Motivo |
| --- | --- |
| Confirmación de contraseña | solo se compara con la contraseña |
| Nombre del archivo sin la ruta | no alcanza para volver a abrir el documento |
| Aviso “instrucciones enviadas” de recuperar contraseña | es un mensaje de la pantalla |
| Textos de bienvenida y felicitaciones del registro | son copia fija |
| Logo, colores y páginas de privacidad, términos y recursos | no son datos de usuarios |
| Mes fijo de octubre de 2026 en el calendario visual | la cita real se guarda con su `fecha` |
