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

## Uso

### Ejecuta la API en modo de desarrollo:

    ```bash
    npm run start:dev

### Accede a la API:
    ```bash
    http://localhost:3000/

###WebSockets:
La API utiliza WebSockets para la comunicación en tiempo real entre los jugadores. Para interactuar con los WebSockets, debes conectar tu front-end al WebSocket de la API.







