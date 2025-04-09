import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeAudioService } from './youtube-audio.service';

describe('YoutubeAudioService', () => {
  let service: YoutubeAudioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeAudioService],
    }).compile();

    service = module.get<YoutubeAudioService>(YoutubeAudioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
