import { client } from 'src/utils/createClient';

export const getAvailableRooms = async () => {
  const query = `
        SELECT * FROM Rooms
    `;

  try {
    const response = await client.execute(query);
    const { rows } = response;
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Error conectar con la bd');
  }
};
