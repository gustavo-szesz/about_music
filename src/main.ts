import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(); // Enable CORS for all routes

    // Serve static files from the 'public' directory
    app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
