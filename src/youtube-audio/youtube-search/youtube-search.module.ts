import { Module } from '@nestjs/common';
import { YouTubeSearchController } from 'src/youtube-search/youtube-search.controller';

@Module({})
export class YoutubeSearchModule {
    controllers: [YouTubeSearchController];
}
