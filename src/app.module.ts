import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WikipediaModule } from './wikipedia/wikipedia.module';
import { WikipediaFormatterService } from './wikipedia/wikipedia_formatter.service';
import { HttpModule } from '@nestjs/axios';
import { LyricsModule } from './lyrics/lyrics.module';

@Module({
  imports: [WikipediaModule, LyricsModule],
  controllers: [AppController],
  providers: [AppService, WikipediaFormatterService],
})
export class AppModule {}
