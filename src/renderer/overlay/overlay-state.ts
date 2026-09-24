export type OverlayState =
  | { status: 'HIDDEN' }
  | { status: 'THINKING' }
  | { status: 'ANSWER'; streamedText: string }
  | { status: 'ERROR'; errorMessage: string };
