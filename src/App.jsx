// Core imports for routing and UI framework
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import CustomerList from './pages/CustomerList';
import TrainingList from './pages/TrainingList';
import CalendarPage from './pages/Calendar';
import StatisticsPage from './pages/Statistics';

// Theme configuration for Material-UI
// This defines the visual style of the entire application
// OPTIONAL: You can modify these values to change the app's appearance
const theme = createTheme({
  palette: {
    // Light mode color scheme
    mode: 'light',
    primary: {
      main: '#2563eb',     // Main brand color
      dark: '#1d4ed8',     // Used for hover states
      light: '#60a5fa',    // Used for subtle backgrounds
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0284c7',     // Secondary actions and information
      dark: '#0369a1',
      light: '#38bdf8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',  // Page background
      paper: '#ffffff',    // Card and surface colors
    },
    text: {
      primary: '#0f172a',  // Main text color
      secondary: '#334155', // Less prominent text
    },
  },
  // OPTIONAL: Component style customizations
  components: {
    // Data grid styling (used in list views)
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: '2px solid #2563eb',
            outlineOffset: '-1px',
          },
        },
        columnHeader: {
          backgroundColor: '#f1f5f9',
          color: '#0f172a',
          fontWeight: 600,
        },
      },
    },
    // Text field styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: 2,
            },
          },
        },
      },
    },
    // Button styling
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&:focus-visible': {
            outline: '2px solid #2563eb',
            outlineOffset: 2,
          },
        },
        containedSecondary: {
          backgroundColor: '#0284c7',
          '&:hover': {
            backgroundColor: '#0369a1',
          },
        },
      },
    },
  },
  // Typography settings for consistent text styling
  typography: {
    h4: {
      fontWeight: 600,
      color: '#0f172a',
    },
    body1: {
      color: '#334155',
    },
  },
});

// Main App component that sets up:
// 1. Material-UI theming
// 2. Toast notifications (bottom-center)
// 3. Routing between different pages
// 4. Global layout wrapper
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="bottom-center" expand={true} richColors />
      <Router>
        <Layout>
          <Routes>
            {/* Default route redirects to customer list */}
            <Route path="/" element={<CustomerList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/trainings" element={<TrainingList />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;