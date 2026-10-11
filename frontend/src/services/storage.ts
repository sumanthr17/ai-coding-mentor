/**
 * Local Storage manager for user learning progress, stats, and editor settings
 */
import type { UserProgress, UserProfile } from '../types/progress';
import { STAGES } from '../types/progress';
import type { Puzzle } from '../types/api';

const STORAGE_KEY = 'ai_coding_mentor_progress_v1';

export const DEFAULT_STARTER_CODE = `#include <stdio.h>

int main() {
    // Welcome to AI Coding Mentor!
    // Write your C program here and click 'Run Code' or press Ctrl+Enter.
    printf("Hello, C World!\\n");
    return 0;
}
`;

const DEFAULT_PROFILE: UserProfile = {
  name: 'C Learner',
  title: 'Beginning Programmer',
  joinedDate: 'October 2026',
  fontSize: 14,
  autoRunOnShortcut: true,
};

const DEFAULT_PROGRESS: UserProgress = {
  solvedPuzzleIds: [],
  totalCodeRuns: 0,
  totalAiHintsRequested: 0,
  totalErrorsExplained: 0,
  currentCodeDraft: DEFAULT_STARTER_CODE,
  profile: DEFAULT_PROFILE,
};

export const storageService = {
  getProgress(): UserProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_PROGRESS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        profile: {
          ...DEFAULT_PROFILE,
          ...(parsed.profile || {}),
        },
      };
    } catch {
      return DEFAULT_PROGRESS;
    }
  },

  saveProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  },

  markPuzzleSolved(puzzleId: string): void {
    const progress = this.getProgress();
    if (!progress.solvedPuzzleIds.includes(puzzleId)) {
      progress.solvedPuzzleIds.push(puzzleId);
      this.saveProgress(progress);
    }
  },

  incrementCodeRuns(): void {
    const progress = this.getProgress();
    progress.totalCodeRuns += 1;
    this.saveProgress(progress);
  },

  incrementAiHints(): void {
    const progress = this.getProgress();
    progress.totalAiHintsRequested += 1;
    this.saveProgress(progress);
  },

  incrementErrorsExplained(): void {
    const progress = this.getProgress();
    progress.totalErrorsExplained += 1;
    this.saveProgress(progress);
  },

  saveCodeDraft(code: string): void {
    const progress = this.getProgress();
    progress.currentCodeDraft = code;
    this.saveProgress(progress);
  },

  updateProfile(profileUpdate: Partial<UserProfile>): void {
    const progress = this.getProgress();
    progress.profile = { ...progress.profile, ...profileUpdate };
    this.saveProgress(progress);
  },

  resetProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Determine if a given stage is unlocked based on solved puzzles.
   * Architecture rule: "Unlock the next stage after correctly solving three distinct puzzles in the current stage."
   */
  isStageUnlocked(stageId: number, puzzles: Puzzle[]): boolean {
    if (stageId <= 1) return true; // Stage 1 is always unlocked

    const progress = this.getProgress();
    const previousStage = STAGES.find((s) => s.id === stageId - 1);
    if (!previousStage) return false;

    // Filter puzzles that belong to previous stage slug
    const prevStagePuzzles = puzzles.filter((p) => p.topic.toLowerCase() === previousStage.slug.toLowerCase());
    
    // Count how many from prev stage are solved
    const solvedFromPrev = prevStagePuzzles.filter((p) =>
      progress.solvedPuzzleIds.includes(p.id)
    ).length;

    // If there aren't 3 puzzles available in backend, unlock if all available in previous stage are solved (or if count >= 3)
    const required = Math.min(3, Math.max(1, prevStagePuzzles.length));
    return solvedFromPrev >= required;
  },
};
