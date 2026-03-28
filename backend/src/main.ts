import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
      : [
          'http://localhost:5173',
          'http://localhost:5174',
        ],
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Who's Next? API running on port ${port}`);
}
bootstrap();
