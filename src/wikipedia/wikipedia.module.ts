import { Module } from '@nestjs/common';
import { WikipediaController } from './wikipedia.controller';
import { WikipediaService } from './wikipedia.service';
import { HttpModule } from '@nestjs/axios';
import { WikipediaFormatterService } from './wikipedia_formatter.service';

@Module({
  imports: [HttpModule],
  controllers: [WikipediaController],
  providers: [WikipediaService, WikipediaFormatterService]
})
export class WikipediaModule {}
