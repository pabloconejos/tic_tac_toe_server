export interface IRoom {
  id: string;
  state: 'waiting' | 'in_progress' | 'finished';
  turn: 'X' | 'O';
  board: any;
  jugador1_id?: string;
  jugador2_id?: string;
  date_creation?: Date;
  winner?: number;
}
