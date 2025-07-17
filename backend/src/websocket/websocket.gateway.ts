import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private adminClients = new Map<string, Socket>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        
        // If user is admin, add to admin clients
        if (payload.isAdmin) {
          this.adminClients.set(client.id, client);
          console.log(`Admin connected: ${payload.username}`);
        }
        
        console.log(`User connected: ${payload.username} (${client.id})`);
      } else {
        console.log(`Anonymous user connected: ${client.id}`);
      }
    } catch (error) {
      console.log(`Invalid token on connection: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.adminClients.delete(client.id);
    const username = client.data.user?.username || 'Anonymous';
    console.log(`User disconnected: ${username} (${client.id})`);
  }

  @SubscribeMessage('join-admin-room')
  handleJoinAdminRoom(@ConnectedSocket() client: Socket) {
    if (client.data.user?.isAdmin) {
      client.join('admin-room');
      return { success: true, message: 'Joined admin room' };
    }
    return { success: false, message: 'Access denied' };
  }

  // Method to notify admins of new feedback
  notifyAdminsNewFeedback(feedback: any) {
    // Send notification to all clients in the admin room
    this.server.to('admin-room').emit('new-feedback', {
      type: 'NEW_FEEDBACK',
      data: feedback,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any): string {
    return 'Hello world!';
  }
}
