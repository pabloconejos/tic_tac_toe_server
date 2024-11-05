import { createClient } from '@libsql/client';

export const client = createClient({
  url: 'libsql://tictactoe-pabloconejos.turso.io',
  authToken:
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzA4MjQ5NDcsImlkIjoiZjk2MDE2NGMtMGFjNC00ZjJjLWJjYmItMzA3MTZkN2RhZDU2In0.3JBUdORDKXr4LxbiF5EpcUQ21ndc4M6sD55dZBNgnwC12_ULPzO0jrJUXVHJJFCVCpsir9llhGeRm7NNsPj4Bg',
});
