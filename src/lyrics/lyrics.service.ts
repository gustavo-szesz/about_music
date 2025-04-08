import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class LyricsService {
    private readonly apiBaseUrl = 'https://api.lyrics.ovh/v1';

    constructor(
        private readonly httpService: HttpService
    ) {}

    async getLyrics(artist: string, title: string) {
        try {

            const url = `${this.apiBaseUrl}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
            
            const { data } = await firstValueFrom(
                this.httpService.get(url).pipe(
                    catchError((error: AxiosError) => {
                        if (error.response?.status === 404) {
                            throw new HttpException(
                                `Lyrics not found for ${artist} - ${title}`,
                                HttpStatus.NOT_FOUND
                            );
                        }
                        throw new HttpException(
                            `Lyrics API error: ${error.message}`,
                            HttpStatus.INTERNAL_SERVER_ERROR
                        );
                    }),
                ),
            );
            
            // The API returns { lyrics: "lyrics content here" }
            return data;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            
            throw new HttpException(
                `Failed to fetch data from Lyrics API: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,    
            );
        }
    }
}
