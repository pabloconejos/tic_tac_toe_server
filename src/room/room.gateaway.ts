import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { RoomService } from './room.service';

@WebSocketGateway()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(private readonly roomService: RoomService) {}

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
  async handleCreateRoom(client: any, payload: { player1_id: string }) {
    // Lógica para crear una nueva sala usando el servicio
    const newRoom = await this.roomService.createRoom(payload.player1_id);

    // TODO => MIRAR SI ES MAS OPTIMO VOLVER A MANDAR TODAS LAS SALAS O ENVIAR SOLO LA NUEVA
    // Emitir la nueva sala a todos los clientes conectados
    // this.server.emit('roomCreated', newRoom);

    // Emitir el ID de la nueva sala solo al cliente que la creó
    client.emit('roomCreatedForYou', newRoom);

    // También puedes llamar a `getAvailableRooms` para actualizar la lista de salas
    const rooms = await this.roomService.getAvailableRooms();
    this.server.emit('availableRooms', rooms); // Emitir la lista actualizada de salas
  }

  handleDisconnect(client: any) {
    const clientId = client.id; // ID único del cliente, proporcionado por el WebSocket
    console.log(`Cliente desconectado: ${clientId}`);
  }
}