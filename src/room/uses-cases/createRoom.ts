import { randomUUID } from 'crypto';
import { client } from 'src/utils/createClient';

export const createRoom = async (player1_id: string) => {
  const query = `
    INSERT INTO Rooms (id, state, turn, board, jugador1_id, jugador2_id)
    VALUES (? ,?, ?, ?, ?, ?)
  `;

  const tablero = JSON.stringify([]);
  const estadoInicial = 'waiting';
  const jugador2_id = null;
  const id = randomUUID();
  try {
    const response = await client.execute({
      sql: query,
      args: [id, estadoInicial, 'X', tablero, player1_id, jugador2_id],
    });
    return {
      id,
      response,
    }; // Devuelve la respuesta del cliente
  } catch (error) {
    throw new Error('Error al crear la sala en la base de datos');
  }
};
