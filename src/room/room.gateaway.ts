import { RoomService } from './room.service';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { IRoom } from './dto/Room';

@WebSocketGateway()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(private readonly roomService: RoomService) {}

  private roomPlayers: { [key: string]: string[] } = {};

  handleConnection(client: any) {
    const clientId = client.id;
    client.emit('connectionStatus', { id: clientId });
    this.server.emit('playerConnected', { playerId: clientId });
    console.log(`Cliente conectado: ${clientId}`);
  }

  handleDisconnect(client: any) {
    const clientId = client.id;
    console.log(`Cliente desconectado: ${clientId}`);
  }

  @SubscribeMessage('getAvailableRooms')
  async handleGetAvailableRooms(client: any) {
    try {
      const rooms = await this.roomService.getAvailableRooms();
      client.emit('availableRooms', rooms);
    } catch (error) {
      console.error('Error al enviar salas al cliente:', error.message);
      client.emit('error', {
        message:
          'Error al obtener las salas disponibles. Por favor, inténtalo más tarde.',
      });
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(client: any) {
    try {
      const newRoom = await this.roomService.createRoom(client.id);
      // TODO => QUE SOLO PUEDA ESTAR UNIDO A UNA SALA
      client.join(newRoom.id);
      this.handlerSalasAndId(newRoom.id, client.id);
      client.emit('roomCreatedForYou', newRoom);
      this.sendUpdateRooms();
    } catch (error) {
      console.error('Error al crear la sala:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() roomId: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const joinRoom = await this.roomService.joinRoom({
        roomId: roomId,
        player2_id: client.id,
      });

      client.join(roomId);
      this.handlerSalasAndId(roomId, client.id);
      client.emit('joinedRoom', joinRoom);
      this.sendUpdateRooms();

      // Notifica a ambos jugadores que pueden comenzar el juego
      if (this.roomPlayers[roomId].length === 2) {
        this.server.to(roomId).emit('readyToStart', {
          roomId,
          players: this.roomPlayers[roomId],
          roomInfo: joinRoom,
        });
      }
    } catch (error) {
      console.error('Error al unirse a la sala:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('closeRoom')
  async handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Obtiene todos los jugadores en la sala
      const playersInRoom = this.roomPlayers[roomId];

      // Si la sala tiene jugadores, se sale a todos
      if (playersInRoom) {
        playersInRoom.forEach((playerId) => {
          const player = this.server.sockets.sockets.get(playerId);
          if (player) {
            player.leave(roomId);
            player.emit('roomClosed', { roomId });
          }
        });

        // Elimina la sala de los registros
        delete this.roomPlayers[roomId];

        // Cierra la sala en la base de datos o en el servicio correspondiente
        const closeRoom = await this.roomService.closeRoom({ roomId });

        if (!closeRoom.succes) {
          throw new Error('Error al cerrar la sala.');
        }

        // Obtiene las salas disponibles después de cerrar la sala
        const rooms = await this.roomService.getAvailableRooms();
        this.server.emit('availableRooms', rooms);
      } else {
        console.log('No hay jugadores en la sala o la sala no existe');
      }
    } catch (error) {
      console.error('Error al cerrar la sala:', error);
      // Aquí puedes emitir un error al cliente si lo deseas
      client.emit('error', {
        message: 'No se pudo cerrar la sala correctamente',
      });
    }
  }

  @SubscribeMessage('startPlay')
  async startPlay(@MessageBody() roomId: string) {
    try {
      const response = await this.roomService.changeRoomState(roomId);

      if (!response.success) {
        this.server.to(roomId).emit('error', {
          message: 'No se pudo iniciar la partida. Intenta de nuevo más tarde.',
        });
        return;
      }

      this.sendUpdateRooms();

      const room = await this.roomService.getOneRoom(roomId);
      this.server.to(roomId).emit('startPlay', room);
    } catch (error) {
      console.error('Error al iniciar el juego en la sala:', error.message);
      this.server.to(roomId).emit('error', {
        message:
          'Ocurrió un error al intentar iniciar la partida. Por favor, inténtalo de nuevo más tarde.',
      });
    }
  }

  @SubscribeMessage('updateBoard')
  async updateBoard(@MessageBody() roomInfo: IRoom) {
    try {
      const room = await this.roomService.updateBoard(roomInfo);
      this.server.to(room.id).emit('updateBoard', room);
    } catch (error) {
      console.error('Error al iniciar el juego en la sala:', error.message);
      this.server.to(roomInfo.id).emit('error', {
        message: 'Ocurrió un error al actualizar el tablero',
      });
    }
  }

  async sendUpdateRooms() {
    const rooms = await this.roomService.getAvailableRooms(); // devolvemos las salas disponibles a todo el mundo
    this.server.emit('availableRooms', rooms);
  }

  // TODO => PASARLAS A UTILS

  handlerSalasAndId(roomId, clientId) {
    // Guarda el ID del cliente en la sala
    if (!this.roomPlayers[roomId]) {
      this.roomPlayers[roomId] = [];
    }
    this.roomPlayers[roomId].push(clientId); // añadimos el cliente al array de salas
  }
}
