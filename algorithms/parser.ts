/**
 * Note Parser - Auto-generate flashcards from notes
 * Parses Q: / A: syntax
 */

export interface ParsedFlashcard {
    question: string;
    answer: string;
}

export function parseFlashcardsFromNote(content: string): ParsedFlashcard[] {
    const flashcards: ParsedFlashcard[] = [];
    if (!content || content.trim().length === 0) return flashcards;

    const lines = content.split('\n');
    let currentQuestion: string | null = null;
    let currentAnswer: string | null = null;
    let questionBuffer: string[] = [];
    let answerBuffer: string[] = [];
    let isInQuestion = false;
    let isInAnswer = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const questionMatch = line.match(/^[*_]?Q(?:uestion)?[*_]?\s*[:：]\s*(.+)$/i);
        const answerMatch = line.match(/^[*_]?A(?:nswer)?[*_]?\s*[:：]\s*(.+)$/i);

        if (questionMatch) {
            if (currentQuestion && currentAnswer) {
                flashcards.push({
                    question: currentQuestion.trim(),
                    answer: currentAnswer.trim(),
                });
            }
            currentQuestion = questionMatch[1];
            questionBuffer = [questionMatch[1]];
            currentAnswer = null;
            answerBuffer = [];
            isInQuestion = true;
            isInAnswer = false;
        } else if (answerMatch && currentQuestion) {
            currentAnswer = answerMatch[1];
            answerBuffer = [answerMatch[1]];
            isInQuestion = false;
            isInAnswer = true;
        } else if (line.length > 0 && !line.startsWith('#')) {
            if (isInQuestion && currentQuestion) {
                questionBuffer.push(line);
                currentQuestion = questionBuffer.join(' ');
            } else if (isInAnswer && currentAnswer) {
                answerBuffer.push(line);
                currentAnswer = answerBuffer.join(' ');
            }
        } else if (line.length === 0 || line.startsWith('#')) {
            isInQuestion = false;
            isInAnswer = false;
        }
    }

    if (currentQuestion && currentAnswer) {
        flashcards.push({
            question: currentQuestion.trim(),
            answer: currentAnswer.trim(),
        });
    }

    return flashcards
        .filter(card => card.question.length > 0 && card.answer.length > 0)
        .map(card => ({
            question: cleanText(card.question),
            answer: cleanText(card.answer),
        }));
}

function cleanText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[*_]{1,2}(.+?)[*_]{1,2}/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .trim();
}

export function countFlashcardsInNote(content: string): number {
    if (!content) return 0;
    const questionMatches = content.match(/^[*_]?Q(?:uestion)?[*_]?\s*[:：]/gim);
    const answerMatches = content.match(/^[*_]?A(?:nswer)?[*_]?\s*[:：]/gim);
    const questionCount = questionMatches ? questionMatches.length : 0;
    const answerCount = answerMatches ? answerMatches.length : 0;
    return Math.min(questionCount, answerCount);
}
