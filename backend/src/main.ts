import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from root directory BEFORE importing other modules
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Ensure crypto is available globally (Node.js 18+ compatibility)
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Enables CORS with default settings (allow all)
  await app.listen(process.env.PORT ?? 3009);
  console.log(`Backend is running on port ${process.env.PORT ?? 3009}`);
  console.log(`JWT Secret loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
}
bootstrap();
