import { Injectable } from '@nestjs/common';
import { getAvailableRooms } from './uses-cases/getAvaliableRooms';
import { createRoom } from './uses-cases/createRoom';
import { joinRoom } from './uses-cases/joinRoom';
import { getOneRoom } from './uses-cases/getOneRoom';
import { deleteRoom } from './uses-cases/deleteRoom';

@Injectable()
export class RoomService {
  async getAvailableRooms() {
    try {
      const rooms = await getAvailableRooms();
      return rooms;
    } catch (error) {
      console.error('Error al obtener las salas:', error);
      throw error; // Vuelve a lanzar el error para manejarlo más arriba si es necesario
    }
  }

  async createRoom(playerId: string) {
    try {
      const room = await createRoom(playerId);
      return room;
    } catch (error) {
      console.error('Error al obtener las salas:', error);
      throw error; // Vuelve a lanzar el error para manejarlo más arriba si es necesario
    }
  }

  async joinRoom(payload: { roomId: string; player2_id: string }) {
    const { roomId, player2_id } = payload;

    try {
      const response = await joinRoom(roomId, player2_id);
      return this.getOneRoom(response);
    } catch (error) {
      console.error('Error al unirse a la sala:', error.message);

      // Devolver un mensaje de error personalizado al cliente
      throw new Error(
        'No se pudo unir a la sala. Asegúrate de que la sala esté disponible y que el jugador 2 no esté ya asignado.',
      );
    }
  }

  async closeRoom(payload: { roomId: string }) {
    const { roomId } = payload;
    try {
      const response = await deleteRoom(roomId);
      console.log('sala eliminada:', response);
      return { succes: true, message: 'Sala eliminada' };
    } catch (error) {
      console.error('Error al cerrar la sala:', error);
    }
  }

  async getOneRoom(roomId: string) {
    const room = await getOneRoom(roomId);
    return room[0];
  }
}
