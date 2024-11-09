import { client } from 'src/utils/createClient';

export const setWinner = async (turn: string, roomId: string) => {
  const query = `
    UPDATE Rooms 
    SET winner = ?, state = 'finished' 
    WHERE id = ?
`;

  try {
    const response = await client.execute({
      sql: query,
      args: [turn, roomId],
    });

    if (response.rowsAffected === 0) {
      throw new Error('Ha ocurrido un error');
    }

    return { succes: true };
  } catch (error) {
    console.error('Error en la base de datos:', error.message);
    throw new Error('Error al procesar la solicitud en la base de datos.');
  }
};
