import { client } from 'src/utils/createClient';

export const changeRoomState = async (roomId: string) => {
  const query = `
        UPDATE Rooms 
        SET state = ? 
        WHERE id = ?
    `;

  try {
    const response = await client.execute({
      sql: query,
      args: ['in_progress', roomId],
    });

    if (response.rowsAffected === 0) {
      throw new Error('Ha ocurrido un error');
    }

    return { success: true };
  } catch (error) {
    console.error('Error en la base de datos:', error.message);
    throw new Error('Error al procesar la solicitud en la base de datos.');
  }
};
