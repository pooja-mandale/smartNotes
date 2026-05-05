/**
 * SM-2 Algorithm Implementation
 * Spaced Repetition System for flashcard review
 */

export interface SM2Input {
    quality: 0 | 1 | 2 | 3;
    repetitions: number;
    easinessFactor: number;
    interval: number;
}

export interface SM2Output {
    repetitions: number;
    easinessFactor: number;
    interval: number;
    nextReviewDate: Date;
}

export function calculateSM2(input: SM2Input): SM2Output {
    const { quality, repetitions, easinessFactor, interval } = input;

    if (quality < 0 || quality > 3) {
        throw new Error('Quality must be between 0 and 3');
    }

    let newRepetitions = repetitions;
    let newEasinessFactor = easinessFactor;
    let newInterval = interval;

    newEasinessFactor = easinessFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    if (newEasinessFactor < 1.3) {
        newEasinessFactor = 1.3;
    }

    if (quality < 2) {
        newRepetitions = 0;
        newInterval = 1;
    } else {
        newRepetitions = repetitions + 1;
        if (newRepetitions === 1) {
            newInterval = 1;
        } else if (newRepetitions === 2) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * newEasinessFactor);
        }

        if (quality === 3) {
            newInterval = Math.round(newInterval * 1.3);
        } else if (quality === 1) {
            newInterval = Math.round(newInterval * 0.7);
        }
    }

    if (newInterval < 1) newInterval = 1;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    nextReviewDate.setHours(0, 0, 0, 0);

    return {
        repetitions: newRepetitions,
        easinessFactor: Number(newEasinessFactor.toFixed(2)),
        interval: newInterval,
        nextReviewDate,
    };
}

export function initializeSM2(): Omit<SM2Output, 'nextReviewDate'> & { nextReviewDate: string } {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return {
        repetitions: 0,
        easinessFactor: 2.5,
        interval: 0,
        nextReviewDate: now.toISOString(),
    };
}

export function isDue(nextReviewDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDate = new Date(nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate <= today;
}
