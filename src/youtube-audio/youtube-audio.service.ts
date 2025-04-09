import { Injectable } from '@nestjs/common';
const ytdl = require('ytdl-core');
import * as ffmpeg from 'fluent-ffmpeg';
import { Response } from 'express';

@Injectable()
export class YoutubeAudioService {
  async streamAudio(videoId: string, res: Response) {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log('Video ID:', videoId);
      console.log('Video URL:', videoUrl);
      
      // Validate the video ID
      if (!ytdl.validateID(videoId)) {
        throw new Error('Invalid video ID');
      }

      // Get audio stream from YouTube with custom user agent
      const audioStream = ytdl(videoUrl, {
        quality: 'highestaudio',
        filter: 'audioonly',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        },
      });

      // Set response headers for MP3 streaming
      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      });
      
      // Convert stream to MP3 using ffmpeg and pipe to response
      ffmpeg(audioStream)
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          if (!res.headersSent) {
            res.status(500).send('Error processing audio');
          }
        })
        .pipe(res, { end: true });
        
      // Add error handler for the audioStream
      audioStream.on('error', (err) => {
        console.error('YouTube stream error:', err.message);
        if (!res.headersSent) {
          res.status(500).send('Error streaming from YouTube');
        }
      });

    } catch (error) {
      console.error('Error streaming audio:', error.message);
      if (!res.headersSent) {
        res.status(500).send('Error streaming audio');
      }
    }
  }
}
