export const pageHeaderSx = (theme: import('@mui/material/styles').Theme) => ({
  bgcolor: 'custom.pageHeader',
  borderBottom: `1px solid ${theme.palette.custom.pageHeaderBorder}`,
  minHeight: { xs: 72, sm: 100 },
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  py: { xs: 1.5, sm: 2.5 },
  '& .MuiTypography-root, & .MuiSvgIcon-root, & .MuiButton-root': {
    color: 'common.white',
  },
  '& .MuiButton-root': {
    borderColor: 'common.white',
  },
  '& .MuiButton-contained': {
    backgroundColor: 'transparent',
    border: '1px solid currentColor',
    '&:hover': {
      backgroundColor: 'custom.pageHeaderHover',
    },
  },
});

export const pageHeaderContentSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: { xs: 1, sm: 2 },
};

export const pageHeaderTitleSx = {
  fontSize: { xs: '1.375rem', sm: '1.75rem' },
  fontWeight: 600,
  lineHeight: 1.25,
  color: 'common.white',
};

export const pageHeaderIconSx = {
  fontSize: 24,
  color: 'common.white',
  flexShrink: 0,
};

export const pageHeaderButtonSx = {
  minHeight: { xs: 40, sm: 42 },
  px: 2,
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'common.white',
  borderColor: 'common.white',
  '&:hover': {
    borderColor: 'common.white',
    backgroundColor: 'custom.pageHeaderHover',
  },
  '& .MuiButton-startIcon': {
    marginRight: 1,
  },
};
