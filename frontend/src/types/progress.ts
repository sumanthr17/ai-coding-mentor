/**
 * Learning progress types stored in localStorage
 */

export interface StageDefinition {
  id: number;
  slug: string;
  title: string;
  description: string;
  requiredPuzzlesToUnlock: number;
}

export const STAGES: StageDefinition[] = [
  {
    id: 1,
    slug: 'variables',
    title: 'Stage 1: Variables & Operators',
    description: 'Data types, declarations, arithmetic, and basic syntax.',
    requiredPuzzlesToUnlock: 0, // Unlocked by default
  },
  {
    id: 2,
    slug: 'conditionals',
    title: 'Stage 2: Conditional Statements',
    description: 'If-else branching, switch-case, and Boolean logic.',
    requiredPuzzlesToUnlock: 3, // Requires 3 solved in stage 1
  },
  {
    id: 3,
    slug: 'loops',
    title: 'Stage 3: Loops & Iteration',
    description: 'While, for loops, nested loops, break and continue.',
    requiredPuzzlesToUnlock: 3, // Requires 3 solved in stage 2
  },
  {
    id: 4,
    slug: 'mixed-logic',
    title: 'Stage 4: Mixed Logic',
    description: 'Functions, arrays, combined algorithm puzzles.',
    requiredPuzzlesToUnlock: 3, // Requires 3 solved in stage 3
  },
];

export interface UserProfile {
  name: string;
  title: string;
  joinedDate: string;
  fontSize: number;
  autoRunOnShortcut: boolean;
}

export interface UserProgress {
  solvedPuzzleIds: string[];
  totalCodeRuns: number;
  totalAiHintsRequested: number;
  totalErrorsExplained: number;
  currentCodeDraft: string;
  profile: UserProfile;
}
