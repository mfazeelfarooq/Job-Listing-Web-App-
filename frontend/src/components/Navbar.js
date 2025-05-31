import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  useScrollTrigger,
  Slide,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import MenuIcon from '@mui/icons-material/Menu';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function Navbar() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <HideOnScroll>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar 
            disableGutters 
            sx={{ 
              minHeight: { xs: 64, sm: 70 },
              px: { xs: 2, sm: 3 },
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'primary.main',
                flexGrow: 1,
              }}
            >
              <WorkIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Job Listings
              </Typography>
            </Box>

            {isMobile ? (
              <IconButton
                color="primary"
                aria-label="menu"
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/"
                  color={location.pathname === '/' ? 'primary' : 'inherit'}
                  sx={{
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.04)',
                    },
                  }}
                >
                  Browse Jobs
                </Button>
                <Button
                  component={RouterLink}
                  to="/add"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    px: 3,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Post a Job
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
}

export default Navbar; 