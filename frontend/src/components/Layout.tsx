import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const currentPath = location.pathname;
  
  const isDetailsPage = currentPath.includes('/schedule/') || 
                       currentPath === '/success' ||
                       currentPath === '/all-schedules';

  const handleNavigation = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'home') {
      navigate('/');
    } else if (newValue === 'profile') {
      navigate('/');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      pb: isMobile && !isDetailsPage ? 7 : 0,
    }}>
      <Box component="main" sx={{ flexGrow: 1, px: 2, py: 2 }}>
        <Outlet />
      </Box>
      
      {isMobile && !isDetailsPage && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 1000,
            borderTop: '1px solid #E0E0E0',
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={currentPath === '/' ? 'home' : 'profile'}
            onChange={handleNavigation}
            sx={{
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <BottomNavigationAction
              label="Home"
              value="home"
              icon={<HomeIcon />}
            />
            <BottomNavigationAction
              label="Profile"
              value="profile"
              icon={<PersonIcon />}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default Layout; 