import { Injectable } from "@nestjs/common";
import { CreateWikipediaArticleDto } from "./dto/create-wikipedia_article.dto";

interface Section {
    title: string;
    content: string;
}

@Injectable()
export class WikipediaFormatterService {
    formatArticleText(title: string, fullText: string): CreateWikipediaArticleDto {
        const lines = fullText.split("\n");
        const sections: Section[] = [];

        let currentSection = { title: "Introduction", content: '' };
        let inSection = false;

        for (const line of lines) {
            // Detect section headings (usually lines ending with edit)
            if (line.trim().match(/^==\s*.+\s*==$/)) {
              // Save previous section if it has content
              if (currentSection.content.trim()) {
                sections.push({ ...currentSection });
              }
              
              // Start new section
              const sectionTitle = line.replace(/==/g, '').trim();
              currentSection = { title: sectionTitle, content: '' };
              inSection = true;
            } else {
              // Add content to current section
              if (line.trim()) {
                currentSection.content += line + '\n';
              }
            }
        }
      
        // Add the last section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
      
        // Calculate word count
        const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
      
        // Format article to DTO
        const articleDto: CreateWikipediaArticleDto = {
          title,
          content: {
            fullText,
            formattedSections: sections
          },
          metadata: {
            wordCount
          }
        };
      
        return articleDto;
    }
}