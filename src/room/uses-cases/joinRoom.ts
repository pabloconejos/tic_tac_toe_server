import { client } from 'src/utils/createClient';

export const joinRoom = async (roomId: string, player2_id: string) => {
  const query = `
        UPDATE Rooms 
        SET jugador2_id = ? 
        WHERE id = ? AND jugador2_id IS NULL
    `;

  try {
    const response = await client.execute({
      sql: query,
      args: [player2_id, roomId],
    });

    if (response.rowsAffected === 0) {
      throw new Error('La sala ya tiene un segundo jugador.');
    }

    return roomId;
  } catch (error) {
    console.error('Error en la base de datos:', error.message);
    throw new Error('Error al procesar la solicitud en la base de datos.');
  }
};
