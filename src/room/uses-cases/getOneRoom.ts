import { client } from 'src/utils/createClient';

export const getOneRoom = async (roomId: string) => {
  const query = `
        SELECT * FROM Rooms WHERE id = ?
    `;

  try {
    const response = await client.execute({
      sql: query,
      args: [roomId],
    });
    const { rows } = response;
    return rows;
  } catch (error) {
    throw new Error('Error al crear la sala en la base de datos');
  }
};
