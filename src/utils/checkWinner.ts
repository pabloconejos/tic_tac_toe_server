export function checkWinner(board: string[], turn: string): { winner: string } {
  if (board.some((pos) => pos == '')) {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const isWinner = winningCombinations.some((combination) =>
      combination.every((index) => board[index] === turn),
    );

    if (!isWinner) {
      return {
        winner: null,
      };
    }

    return {
      winner: turn,
    };
  }

  return {
    winner: 'tie',
  };
}
