import { RoomService } from './room.service';
import { error } from 'console';
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
import { client } from '../utils/createClient';

@WebSocketGateway()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(private readonly roomService: RoomService) {}

  private roomPlayers: { [key: string]: string[] } = {}; // Para almacenar los jugadores en cada sala

  handleConnection(client: any) {
    const clientId = client.id; // ID único del cliente, proporcionado por el WebSocket
    console.log(`Cliente conectado: ${clientId}`);

    client.emit('connectionStatus', {
      message: 'Bienvenido al servidor de Tic Tac Toe!',
      id: clientId,
    });

    // 4. Emitir actualización del estado de la sala a otros jugadores si es necesario
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

    client.join(newRoom.id); // le decimos al cliente que se ha unido a la sala con id newRoomId
    // Guarda el ID del cliente en la sala
    this.handlerSalasAndId(newRoom.id, client.id);
    const rooms = await this.roomService.getAvailableRooms(); // devolvemos las salas disponibles a todo el mundo
    this.server.emit('availableRooms', rooms);
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
    // client.emit('joinedRoom', roomId); // le emitimos al cliente que se ha unido a una sala (ver si se puede quitar)

    // Notifica a ambos jugadores que pueden comenzar el juego
    if (this.roomPlayers[roomId].length === 2) {
      this.server.to(roomId).emit('readyToStart', {
        roomId,
        players: this.roomPlayers[roomId],
        roomInfo: joinRoom,
      });
    }
  }

  handlerSalasAndId(roomId, clientId) {
    // Guarda el ID del cliente en la sala
    if (!this.roomPlayers[roomId]) {
      this.roomPlayers[roomId] = [];
    }
    this.roomPlayers[roomId].push(clientId); // añadimos el cliente al array de salas
  }

  // @SubscribeMessage('joinRoom')
  // async handleJoinRoom(
  //   client: any,
  //   payload: { roomId: string; player2_id: string },
  // ) {
  //   try {
  //     const joinRoom = await this.roomService.joinRoom(payload);
  //     client.emit('roomJoinedInfo', joinRoom);

  //     const rooms = await this.roomService.getAvailableRooms();
  //     this.server.emit('availableRooms', rooms);
  //   } catch (error) {
  //     console.error('Error en handleJoinRoom:', error.message);
  //     // Emitir error al cliente
  //     client.emit('roomJoinedInfo', { success: false, message: error.message });
  //   }
  // }

  @SubscribeMessage('closeRoom')
  async closeRoom(client: any, payload: { roomId: string }) {
    const closeRoom = await this.roomService.closeRoom(payload);

    if (!closeRoom.succes) {
      throw new error();
    }
    const rooms = await this.roomService.getAvailableRooms();
    this.server.emit('availableRooms', rooms); // Emitir la lista actualizada de salas
  }

  handleDisconnect(client: any) {
    const clientId = client.id; // ID único del cliente, proporcionado por el WebSocket
    console.log(`Cliente desconectado: ${clientId}`);
  }
}
