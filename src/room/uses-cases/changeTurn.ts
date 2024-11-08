import { client } from 'src/utils/createClient';

export const changeTurn = async (roomId: string) => {
  const query = `
    UPDATE Rooms
    SET turn = CASE 
                WHEN turn = 'X' THEN 'O' 
                WHEN turn = 'O' THEN 'X' 
            END
    WHERE id = ?;
    `;

  try {
    const response = await client.execute({
      sql: query,
      args: [roomId],
    });

    if (response.rowsAffected === 0) {
      throw new Error('Ha ocurrido un error');
    }

    return roomId;
  } catch (error) {
    console.error('Error en la base de datos:', error.message);
    throw new Error('Error al procesar la solicitud en la base de datos.');
  }
};
