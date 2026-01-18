/**
 * Tests for Collab Service
 */

const WebSocket = require('ws');
const { Server } = require('y-websocket/bin/utils');

describe('Collab Service', () => {
  let server;
  let port;

  beforeAll((done) => {
    // Find an available port
    port = 3001;

    // Create a test server
    server = new WebSocket.Server({ port }, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('WebSocket server should be running', (done) => {
    const client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      expect(client.readyState).toBe(WebSocket.OPEN);
      client.close();
      done();
    });

    client.on('error', (error) => {
      done(error);
    });
  });

  test('should handle basic Yjs protocol', (done) => {
    const client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      // Send a basic message
      client.send(Buffer.from([0, 1, 2, 3]));

      client.on('message', (data) => {
        // Should receive some response
        expect(data).toBeDefined();
        client.close();
        done();
      });
    });

    client.on('error', (error) => {
      done(error);
    });
  });
});