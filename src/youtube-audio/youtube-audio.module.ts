import { Module } from '@nestjs/common';
import { YoutubeAudioController } from './youtube-audio.controller';
import { YoutubeAudioService } from './youtube-audio.service';

@Module({
    controllers: [YoutubeAudioController],
    providers: [YoutubeAudioService],
})
export class YoutubeAudioModule {}
