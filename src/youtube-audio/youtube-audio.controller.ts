import { Controller, Get, Query, Res } from '@nestjs/common';
import { YoutubeAudioService } from './youtube-audio.service';
import { Response } from 'express';

@Controller('youtube-audio')
export class YoutubeAudioController {
    constructor(private readonly youtubeAudioService: YoutubeAudioService) {}

    @Get('stream')
    async streamAudio(@Query('videoId') videoId: string, @Res() res: Response) {
        if (!videoId) {
            return res.status(400).send('Video ID is required');
        }
    await this.youtubeAudioService.streamAudio(videoId, res);
    }
    
}
