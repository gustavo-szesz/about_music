export class CreateWikipediaSearchResultDto {
    query: string;
    totalResults: number;
    results: {
        pageId: number;
        title: string;
        snippet: string;
    }[];
}