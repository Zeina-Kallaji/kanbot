export const pageHeaderSx = {
  bgcolor: '#4b66a0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  minHeight: { xs: 72, sm: 100 },
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  py: { xs: 1.5, sm: 2.5 },
  '& .MuiTypography-root, & .MuiSvgIcon-root, & .MuiButton-root': {
    color: '#ffffff',
  },
  '& .MuiButton-root': {
    borderColor: '#ffffff',
  },
  '& .MuiButton-contained': {
    backgroundColor: 'transparent',
    border: '1px solid #ffffff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
  },
};

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
  color: '#ffffff',
};

export const pageHeaderIconSx = {
  fontSize: 24,
  color: '#ffffff',
  flexShrink: 0,
};

export const pageHeaderButtonSx = {
  minHeight: { xs: 40, sm: 42 },
  px: 2,
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#ffffff',
  borderColor: '#ffffff',
  '&:hover': {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  '& .MuiButton-startIcon': {
    marginRight: 1,
  },
};
