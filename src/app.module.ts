import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WikipediaModule } from './wikipedia/wikipedia.module';

@Module({
  imports: [WikipediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
