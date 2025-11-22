export interface Note {
  id: string;
  title: string;
  content: string;
  group: string;
  updatedAt: number;
  deletedAt?: number;
}

export enum ViewMode {
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT' // For larger screens if needed
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}
