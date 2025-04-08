import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { WikipediaFormatterService } from './wikipedia_formatter.service';
import { CreateWikipediaArticleDto } from './dto/create-wikipedia_article.dto';

@Injectable()
export class WikipediaService {
    private readonly apiBaseUrl = 'https://en.wikipedia.org/w/api.php';

    constructor(
        private readonly httpService: HttpService,
        private readonly wikipediaFormatterService: WikipediaFormatterService
    ) {}

    async searchWikipedia(query: string) {
        const params = {
            action: 'query',
            format: 'json',
            list: 'search',
            srsearch: query,
            utf8: 1,
            srlimit: 10,
            origin: '*',
        };
        
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(this.apiBaseUrl, { params }).pipe(
                  catchError((error: AxiosError) => {
                    throw new HttpException(
                      `Wikipedia API error: ${error.message}`,
                      HttpStatus.INTERNAL_SERVER_ERROR
                    );
                  }),
                ),
              );
              return data.query.search;
        } catch (error) {
            throw new HttpException(
                `Failed to fetch data from Wikipedia: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getArticleDetails(pageId: number) {
        const params = {
          action: 'query',
          format: 'json',
          prop: 'extracts|info',
          exintro: '1',
          inprop: 'url',
          pageids: pageId.toString(),
          origin: '*'
        };
    
        try {
          const { data } = await firstValueFrom(
            this.httpService.get(this.apiBaseUrl, { params }).pipe(
              catchError((error: AxiosError) => {
                throw new HttpException(
                  `Wikipedia API error: ${error.message}`,
                  HttpStatus.INTERNAL_SERVER_ERROR
                );
              }),
            ),
          );
          
          return data.query.pages[pageId];
        } catch (error) {
          throw new HttpException(
            `Failed to get article details: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
    }

    async getFullArticleText(pageId: number): Promise<CreateWikipediaArticleDto> {
        const params = {
            action: 'query',
            format: 'json',
            prop: 'extracts',
            explaintext: '1',    // This gets the plain text without HTML
            pageids: pageId.toString(),
            origin: '*'
        };
    
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(this.apiBaseUrl, { params }).pipe(
                    catchError((error: AxiosError) => {
                        throw new HttpException(
                            `Wikipedia API error: ${error.message}`,
                            HttpStatus.INTERNAL_SERVER_ERROR
                        );
                    }),
                ),
            );
            
            const page = data.query.pages[pageId];

            return this.wikipediaFormatterService.formatArticleText(page.title, page.extract);

        } catch (error) {
            throw new HttpException(
                `Failed to get full article text: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getArticleByTitle(title: string) {
        // First get the page ID from the title
        const searchParams = {
            action: 'query',
            format: 'json',
            titles: title,
            origin: '*'
        };

        try {
            const { data: searchData } = await firstValueFrom(
                this.httpService.get(this.apiBaseUrl, { params: searchParams }).pipe(
                    catchError((error: AxiosError) => {
                        throw new HttpException(
                            `Wikipedia API error: ${error.message}`,
                            HttpStatus.INTERNAL_SERVER_ERROR
                        );
                    }),
                ),
            );

            // Get the page ID from the response
            const pages = searchData.query.pages;
            const pageId = Object.keys(pages)[0];
            
            // If page not found
            if (pageId === '-1') {
                throw new HttpException(
                    `Article not found: ${title}`,
                    HttpStatus.NOT_FOUND
                );
            }

            // Now get the full content
            return this.getFullArticleText(parseInt(pageId));
        } catch (error) {
            throw new HttpException(
                `Failed to get article by title: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
