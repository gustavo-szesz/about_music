import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WikipediaModule } from './wikipedia/wikipedia.module';
import { WikipediaFormatterService } from './wikipedia/wikipedia_formatter.service';
import { HttpModule } from '@nestjs/axios';
import { LyricsModule } from './lyrics/lyrics.module';
import { YoutubeAudioService } from './youtube-audio/youtube-audio.service';
import { YoutubeAudioController } from './youtube-audio/youtube-audio.controller';
import { YoutubeAudioModule } from './youtube-audio/youtube-audio.module';

@Module({
  imports: [WikipediaModule, LyricsModule, YoutubeAudioModule],
  controllers: [AppController, YoutubeAudioController],
  providers: [AppService, WikipediaFormatterService, YoutubeAudioService],
})
export class AppModule {}
