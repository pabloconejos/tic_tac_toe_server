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

@WebSocketGateway()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(private readonly roomService: RoomService) {}

  private roomPlayers: { [key: string]: string[] } = {};

  handleConnection(client: any) {
    const clientId = client.id;
    // console.log(`Cliente conectado: ${clientId}`);

    client.emit('connectionStatus', {
      id: clientId,
    });

    this.server.emit('playerConnected', { playerId: clientId });
  }

  @SubscribeMessage('getAvailableRooms')
  async handleGetAvailableRooms(client: any) {
    const rooms = await this.roomService.getAvailableRooms();
    client.emit('availableRooms', rooms);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(client: any) {
    const newRoom = await this.roomService.createRoom(client.id); // crear room en la bd
    client.emit('roomCreatedForYou', newRoom); // le notificamos al jugador que crear la sala que se ha creado

    // TODO => QUE SOLO PUEDA ESTAR UNIDO A UNA SALA
    client.join(newRoom.id); // le decimos al cliente que se ha unido a la sala con id newRoomId
    // Guarda el ID del cliente en la sala
    this.handlerSalasAndId(newRoom.id, client.id);
    this.sendUpdateRooms();
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() roomId: any,
    @ConnectedSocket() client: Socket,
  ) {
    const joinRoom = await this.roomService.joinRoom({
      roomId: roomId,
      player2_id: client.id,
    });

    client.join(roomId); // le decimos al cliente que se ha unido a la sala con id newRoomId
    this.handlerSalasAndId(roomId, client.id);
    client.emit('joinedRoom', joinRoom); // le emitimos al cliente que se ha unido a una sala (ver si se puede quitar)

    this.sendUpdateRooms();

    // Notifica a ambos jugadores que pueden comenzar el juego
    if (this.roomPlayers[roomId].length === 2) {
      this.server.to(roomId).emit('readyToStart', {
        roomId,
        players: this.roomPlayers[roomId],
        roomInfo: joinRoom,
      });
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
            // player.emit('roomClosed', { roomId });
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
      client.emit('errorClosingRoom', {
        message: 'No se pudo cerrar la sala correctamente',
      });
    }
  }

  @SubscribeMessage('startPlay')
  async startPlay(@MessageBody() roomId: string) {
    const response = await this.roomService.changeRoomState(roomId);

    if (!response.success) {
      return;
    }

    this.sendUpdateRooms();

    const room = await this.roomService.getOneRoom(roomId);
    this.server.to(roomId).emit('startPlay', room);
  }

  @SubscribeMessage('updateBoard')
  async updateBoard(
    @MessageBody() boardInfo: { board: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = Array.from(client.rooms).find((room) => room !== client.id);

    const room = await this.roomService.updateBoard(boardInfo.board, roomId);

    this.server.to(roomId).emit('updateBoard', room);
  }

  async sendUpdateRooms() {
    const rooms = await this.roomService.getAvailableRooms(); // devolvemos las salas disponibles a todo el mundo
    this.server.emit('availableRooms', rooms);
  }

  // TODO => PASARLAS A UTILS
  handleDisconnect(client: any) {
    const clientId = client.id; // ID único del cliente, proporcionado por el WebSocket
    console.log(`Cliente desconectado: ${clientId}`);
  }

  handlerSalasAndId(roomId, clientId) {
    // Guarda el ID del cliente en la sala
    if (!this.roomPlayers[roomId]) {
      this.roomPlayers[roomId] = [];
    }
    this.roomPlayers[roomId].push(clientId); // añadimos el cliente al array de salas
  }
}
