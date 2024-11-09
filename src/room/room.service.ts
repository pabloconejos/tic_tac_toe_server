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
import { checkWinner } from 'src/utils/checkWinner';
import { IRoom } from './dto/Room';
import { setWinner } from './uses-cases/setWinner';

@Injectable()
export class RoomService {
  async getAvailableRooms() {
    try {
      const rooms = await getAvailableRooms();
      return rooms;
    } catch (error) {
      console.error('Error al obtener las salas:', error.message);
      throw new Error('No se pudieron obtener las salas disponibles');
    }
  }

  async createRoom(playerId: string) {
    try {
      const room = await createRoom(playerId);
      return room;
    } catch (error) {
      console.error('Error al crear la sala:', error.message);
      throw error; // Re-lanzamos el error para que el controlador lo maneje
    }
  }

  async joinRoom(payload: { roomId: string; player2_id: string }) {
    const { roomId, player2_id } = payload;

    try {
      const response = await joinRoom(roomId, player2_id);
      return this.getOneRoom(response);
    } catch (error) {
      console.error('Error al unirse a la sala:', error.message);
      throw new Error(
        'No se pudo unir a la sala. Asegúrate de que la sala esté disponible.',
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
      throw new Error('No se pudo cerrar la sala.');
    }
  }

  async changeRoomState(roomId: string) {
    try {
      const result = await changeRoomState(roomId);
      return result;
    } catch (error) {
      console.error('Error al cambiar el estado de la sala:', error.message);
      throw new Error('No se pudo cambiar el estado de la sala');
    }
  }

  async updateBoard(room: IRoom) {
    try {
      const response = await updateBoard(room.board, room.id);
      if (checkWinner(room.board, room.turn)) {
        await setWinner(room.turn, room.id);
      }
      if (!response.succes) {
        throw new Error('No se pudo cambiar el estado del tablero');
      }

      const updatedRoom = await changeTurn(room.id);
      return getOneRoom(updatedRoom);
    } catch (error) {
      console.error('Error al cambiar el estado de la sala:', error.message);
      // Devolver un mensaje de error personalizado al cliente
      throw new Error('No se pudo cambiar el estado del tablero');
    }
  }

  async getOneRoom(roomId: string) {
    const room = await getOneRoom(roomId);
    return room;
  }
}
