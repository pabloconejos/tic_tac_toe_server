import { client } from 'src/utils/createClient';

export const deleteRoom = async (roomId: string) => {
  const query = `
        DELETE FROM Rooms WHERE id = ?
    `;

  try {
    const response = await client.execute({
      sql: query,
      args: [roomId],
    });
    const { rows } = response;
    return rows;
  } catch (error) {
    throw new Error('Error al eliminar la sala en la base de datos');
  }
};
