// Layout component that provides the main structure for all pages
// Includes navigation bar, container, and database reset functionality
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { toast } from 'sonner';
import axios from 'axios';

// OPTIONAL STYLING: Custom styled navigation link
// Enhances the default RouterLink with hover effects and focus states
const StyledLink = styled(RouterLink)`
  color: white;
  text-decoration: none;
  margin: 0 16px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  position: relative;
  font-weight: 500;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: white;
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    color: white;
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.25);
    color: white;
  }
`;

// OPTIONAL STYLING: Custom styled app bar
// Uses the primary color from the theme for consistency
const StyledAppBar = styled(AppBar)`
  background-color: ${props => props.theme.palette.primary.main};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Main Layout component that wraps all pages
// Provides consistent structure with navigation and content area
const Layout = ({ children }) => {
  // Handles resetting the database to its initial state
  // Shows success/error notifications using toast
  const handleResetDatabase = async () => {
    try {
      await axios.post('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/reset');
      toast.success('Database reset successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reset database');
      console.error('Error resetting database:', error);
    }
  };

  return (
    // Main container with full height and width
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
    }}>
      {/* Navigation bar with links and reset button */}
      <StyledAppBar position="static">
        <Toolbar sx={{ maxWidth: 1440, width: '100%', margin: '0 auto' }}>
          {/* App title */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            Personal Trainer
          </Typography>
          {/* Navigation links */}
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            <StyledLink to="/customers">Customers</StyledLink>
            <StyledLink to="/trainings">Trainings</StyledLink>
            <StyledLink to="/calendar">Calendar</StyledLink>
            <StyledLink to="/statistics">Statistics</StyledLink>
            {/* Database reset button */}
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleResetDatabase}
              sx={{
                ml: 2,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Reset Database
            </Button>
          </nav>
        </Toolbar>
      </StyledAppBar>
      {/* Main content area */}
      {/* OPTIONAL STYLING: Container with fixed width and subtle shadow */}
      <Container 
        maxWidth={false}
        sx={{ 
          flex: 1,
          mt: 4,
          mb: 4,
          px: 3,
          maxWidth: '1440px !important',
          minWidth: '1440px !important',
          backgroundColor: 'background.default',
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;