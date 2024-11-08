import { Injectable } from '@nestjs/common';
import { updateBoard } from './uses-cases/updateBoard';
import {
  changeRoomState,
  getAvailableRooms,
  createRoom,
  joinRoom,
  getOneRoom,
  deleteRoom,
} from './uses-cases/index';
import { changeTurn } from './uses-cases/changeTurn';

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
      return { succes: true, message: 'Sala eliminada', response };
    } catch (error) {
      console.error('Error al cerrar la sala:', error);
    }
  }

  async changeRoomState(roomId: string) {
    try {
      await changeRoomState(roomId);
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar el estado de la sala:', error.message);
      // Devolver un mensaje de error personalizado al cliente
      throw new Error('No se pudo cambiar el estado de la sala');
    }
  }

  async updateBoard(board: string[], roomId: string) {
    try {
      const response = await updateBoard(board, roomId);
      if (!response.succes) {
        throw new Error('No se pudo cambiar el estado del tablero');
      }

      const room = await changeTurn(roomId);

      return getOneRoom(room);
    } catch (error) {
      console.error('Error al cambiar el estado de la sala:', error.message);
      // Devolver un mensaje de error personalizado al cliente
      throw new Error('No se pudo cambiar el estado de la sala');
    }
  }

  async getOneRoom(roomId: string) {
    const room = await getOneRoom(roomId);

    // Convertir el valor 'board' que está almacenado como cadena a un array
    if (typeof room[0].board === 'string') {
      room[0].board = JSON.parse(room[0].board); // Convertir de string a array
    }
    return room[0];
  }
}
