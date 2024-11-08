import { client } from 'src/utils/createClient';

export const updateBoard = async (board: string[], roomId: string) => {
  console.log(board);
  const query = `
        UPDATE Rooms 
        SET board = ? 
        WHERE id = ?
    `;

  try {
    const response = await client.execute({
      sql: query,
      args: [board.toString(), roomId],
    }); // todo => ver porque se guarda asi el array ,,,,,1,,1,,,

    if (response.rowsAffected === 0) {
      throw new Error('Ha ocurrido un error');
    }

    return { succes: true };
  } catch (error) {
    console.error('Error en la base de datos:', error.message);
    throw new Error('Error al procesar la solicitud en la base de datos.');
  }
};
