import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Enables CORS with default settings (allow all)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
