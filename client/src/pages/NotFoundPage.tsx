import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { Home, SearchOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * NotFoundPage Component
 * 
 * Friendly 404 page with link to return home.
 */
export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
          <SearchOff
            sx={{
              fontSize: 120,
              color: 'text.disabled',
              opacity: 0.5,
            }}
          />
          
          <Typography variant="h1" color="text.primary">
            404
          </Typography>
          
          <Typography variant="h2" color="text.primary">
            Page not found
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<Home />}
            sx={{ mt: 2 }}
          >
            Go to Home
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
