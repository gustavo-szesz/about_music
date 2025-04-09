import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

// Define interfaces for YouTube API response
interface YouTubeSearchResponse {
  items?: YouTubeItem[];
  error?: {
    message: string;
    code: number;
  };
}

interface YouTubeItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

@Controller('youtube-search')
export class YouTubeSearchController {
  constructor(private configService: ConfigService) {}

  @Get()
  async search(@Query('q') query: string) {
    try {
      // Log the search query for debugging
      console.log(`Searching for: ${query}`);
      
      if (!query) {
        return { error: 'Query parameter is required' };
      }
      
      // Get API key from environment variables
      const apiKey = this.configService.get<string>('YOUTUBE_API_KEY');
      
      if (!apiKey) {
        console.error('YouTube API key not configured');
        return { error: 'YouTube API key not configured' };
      }
      
      // Construct the YouTube API URL with your actual API key
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`;
      
      // Call the YouTube API
      const response = await fetch(apiUrl);
      const data = await response.json() as YouTubeSearchResponse;
      
      // Check for API errors
      if (data.error) {
        console.error('YouTube API Error:', data.error);
        return { error: `YouTube API Error: ${data.error.message}` };
      }
      
      // Check if we got valid results
      if (data.items && data.items.length > 0) {
        console.log('Found video:', data.items[0].snippet.title);
        return {
          videoId: data.items[0].id.videoId,
          title: data.items[0].snippet.title,
          thumbnail: data.items[0].snippet.thumbnails.medium.url
        };
      } else {
        console.log('No videos found for query:', query);
        return { message: 'No videos found' };
      }
    } catch (error) {
      console.error('Error in YouTube search:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}