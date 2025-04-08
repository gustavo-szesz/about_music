export class CreateWikipediaArticleDto {
    title: string;
    url?: string;
    summary?: string;
    comntent: {
        fullText?: string;
        formatedSections?: {
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