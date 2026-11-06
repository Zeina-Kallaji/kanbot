export const pageHeaderSx = {
  bgcolor: '#FFFFFF',
  borderBottom: '1px solid #DCE5F5',
  minHeight: 100,
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  py: { xs: 2, sm: 2.5 },
};

export const pageHeaderContentSx = {
  display: 'flex',
  alignItems: { xs: 'flex-start', sm: 'center' },
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 2,
};

export const pageHeaderTitleSx = {
  fontSize: '1.75rem',
  fontWeight: 600,
  lineHeight: 1.25,
  color: '#1E293B',
};

export const pageHeaderIconSx = {
  fontSize: 24,
  color: '#3159A8',
  flexShrink: 0,
};

export const pageHeaderButtonSx = {
  minHeight: 42,
  px: 2,
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  '& .MuiButton-startIcon': {
    marginRight: 1,
  },
};
