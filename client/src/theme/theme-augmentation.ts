import type {} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      primarySoft: string;
      primarySoftHover: string;
      surfaceSecondary: string;
      todoCard: string;
      todoCardBorder: string;
      borderStrong: string;
      textMuted: string;
      pageHeader: string;
      pageHeaderBorder: string;
      pageHeaderButtonBorder: string;
      pageHeaderHover: string;
      sectionHeader: string;
      sprintSelected: string;
      sprintMuted: string;
      focus: string;
      typeTaskBg: string;
      typeTaskBorder: string;
      typeTaskText: string;
      typeBugBg: string;
      typeBugBorder: string;
      typeBugText: string;
      typeStoryBg: string;
      typeStoryBorder: string;
      typeStoryText: string;
      typeTaskIcon: string;
      typeBugIcon: string;
      typeStoryIcon: string;
      priorityUrgentBg: string;
      priorityUrgentBorder: string;
      priorityUrgent: string;
      priorityUrgentText: string;
      priorityHighBg: string;
      priorityHighBorder: string;
      priorityHighText: string;
      priorityHigh: string;
      priorityMediumBg: string;
      priorityMediumBorder: string;
      priorityMediumText: string;
      priorityMedium: string;
      priorityLowBg: string;
      priorityLowBorder: string;
      priorityLowText: string;
      priorityLow: string;
    };
  }

  interface PaletteOptions {
    custom?: Palette['custom'];
  }
}

export {};
