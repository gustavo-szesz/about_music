import { Controller, Get, Param } from '@nestjs/common';
import { LyricsService } from './lyrics.service';

@Controller('lyrics')
export class LyricsController {
    constructor(private readonly lyricsService: LyricsService) {}

    @Get(':artist/:title')
    async getLyrics(@Param('artist') artist: string, @Param('title') title: string) {
        return this.lyricsService.getLyrics(artist, title);
    }
}
