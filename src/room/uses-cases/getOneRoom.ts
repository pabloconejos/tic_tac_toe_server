import { client } from 'src/utils/createClient';
import { IRoom } from '../dto/Room';

export const getOneRoom = async (roomId: string) => {
  const query = `
        SELECT * FROM Rooms WHERE id = ?
    `;

  try {
    const response = await client.execute({
      sql: query,
      args: [roomId],
    });
    const room = response.rows[0] as unknown as IRoom;
    room.board = room.board.split(',');
    return room;
  } catch (error) {
    throw new Error('Error al crear la sala en la base de datos');
  }
};
