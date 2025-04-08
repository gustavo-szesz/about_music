import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WikipediaModule } from './wikipedia/wikipedia.module';
import { WikipediaFormatterService } from './wikipedia/wikipedia_formatter.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [WikipediaModule],
  controllers: [AppController],
  providers: [AppService, WikipediaFormatterService],
})
export class AppModule {}
