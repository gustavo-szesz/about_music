export class CreateWikipediaArticleDto {
    title: string;
    url?: string;
    summary?: string;
    content: {
        fullText?: string;
        formattedSections?: {
            title: string;
            content: string;
        }[];
    };
    metadata?: {
        lastModified?: string;
        categories?: string[];
        wordCount?: number;
    };
}