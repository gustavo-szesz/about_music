import { Module } from '@nestjs/common';
import { YoutubeAudioController } from './youtube-audio.controller';
import { YoutubeAudioService } from './youtube-audio.service';
import { YoutubeSearchController } from './youtube-search/youtube-search.controller';
import { YoutubeSearchModule } from './youtube-search/youtube-search.module';

@Module({
    controllers: [YoutubeAudioController, YoutubeSearchController],
    providers: [YoutubeAudioService],
    imports: [YoutubeSearchModule],
})
export class YoutubeAudioModule {}
