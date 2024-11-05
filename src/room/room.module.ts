import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomGateway } from './room.gateaway';

@Module({
  providers: [RoomService, RoomGateway],
})
export class RoomModule {}
