import { Injectable } from '@nestjs/common';
import { getAvailableRooms } from './uses-cases/getAvaliableRooms';
import { createRoom } from './uses-cases/createRoom';

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
}
