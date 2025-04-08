import { Controller, Query, Param, Get } from '@nestjs/common';
import { WikipediaService } from './wikipedia.service';

@Controller('wikipedia')
export class WikipediaController {

    constructor(private readonly wikipediaService: WikipediaService) {}

    @Get('search')
    async searchWikipedia(@Query('query') query: string) {
        return this.wikipediaService.searchWikipedia(query);
    }

    @Get('article/:pageId')
    async getArticleDetails(@Param('pageId') pageId: number) {
        return this.wikipediaService.getArticleDetails(pageId);
    }

    @Get('article/:pageId/fulltext')
    async getFullArticleText(@Param('pageId') pageId: number) {
        return this.wikipediaService.getFullArticleText(pageId);
    }

    @Get('article/title/:title')
    async getArticleByTitle(@Param('title') title: string) {
        return this.wikipediaService.getArticleByTitle(title);
    }
}
