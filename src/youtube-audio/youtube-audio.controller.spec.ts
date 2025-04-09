import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeAudioController } from './youtube-audio.controller';

describe('YoutubeAudioController', () => {
  let controller: YoutubeAudioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeAudioController],
    }).compile();

    controller = module.get<YoutubeAudioController>(YoutubeAudioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
