# Tic Tac Toe API

![Logo del proyecto](ruta/a/tu/imagen.png)  

Esta es la API de un juego online de Tic Tac Toe desarrollada en **NestJS**. La API utiliza **WebSockets** para la comunicación en tiempo real entre los jugadores y está conectada a una base de datos SQL para gestionar las salas de juego.

## Requisitos

Antes de comenzar, asegúrate de tener lo siguiente:

- **Node.js** (versión recomendada: v18 o superior)
- **Base de datos SQL** (puede ser MySQL o PostgreSQL)
- **NestJS** instalado globalmente (`npm install -g @nestjs/cli`)

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/tuusuario/tic-tac-toe-api.git
   cd tic-tac-toe-api
2. **Instala las dependencias:**

   ```bash
   npm install
3. **Configura la base de datos:**
   **Crea la tabla Rooms en tu base de datos SQL con el siguiente script SQL:**
   ```sql
   CREATE TABLE Rooms (
      id TEXT PRIMARY KEY,
      state TEXT NOT NULL CHECK (state IN ('waiting','in_progress', 'finished')),
      turn TEXT NOT NULL CHECK (turn IN ('X', 'O')),
      board TEXT NOT NULL DEFAULT '["", "", "", "", "", "", "", "", ""]',
      jugador1_id INTEGER,
      jugador2_id INTEGER,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      winner TEXT
    );
4. **Configura las variables de entorno:**
      ```bash
      PORT=3000
      DATABASE_URL=tu_url_de_conexion_a_la_base_de_datos
      AUTH_TOKEN=tu_token_de_autenticacion

## Cómo Contribuir

¡Gracias por tu interés en contribuir a este proyecto! Aquí te mostramos cómo puedes hacerlo:

### 1. **Fork del Repositorio**

Haz un fork de este repositorio para tener una copia personal en tu cuenta de GitHub.

### 2. **Crea una Rama**

Crea una rama nueva para tus cambios. Asegúrate de nombrar la rama de forma descriptiva (por ejemplo, `feature/nueva-funcionalidad` o `bugfix/correccion-error`).

    git checkout -b mi-nueva-rama

### 3. **Realiza los Cambios**
Haz los cambios necesarios en el código, añade pruebas si es necesario, y asegúrate de que todo funciona correctamente.

### 4. **Realiza un Commit**
Haz un commit con un mensaje claro que describa los cambios realizados.

    git push origin mi-nueva-rama

### 5. **Crea un Pull Request**
Ve al repositorio original y crea un Pull Request desde tu rama hacia la rama `main` del proyecto.

### 5. **Revisión del Pull Request**
El equipo del proyecto revisará tu Pull Request. Si todo está en orden, se fusionará con la rama principal. Si es necesario, puedes recibir comentarios y realizar ajustes adicionales.
