// Import required libraries and components
import { useState, useEffect } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';
import api from '../services/api';

// Set up calendar to start weeks on Monday instead of Sunday
// This is optional - you can remove this if you prefer Sunday as the first day
const locales = {
  'en-US': {
    ...enUS,
    options: {
      ...enUS.options,
      weekStartsOn: 1, // 1 means Monday
    },
  },
};

// Configure the calendar to work with our date formatting
// This setup is required for the calendar to work properly
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Main calendar component that shows all training sessions
const CalendarPage = () => {
  // Store calendar events, current view, and loading state
  const [events, setEvents] = useState([]);  // List of training sessions
  const [view, setView] = useState('month');  // Current calendar view (month/week/day)
  const [loading, setLoading] = useState(true);  // Whether we're loading data

  // Load training data when the component first renders
  useEffect(() => {
    fetchTrainings();
  }, []);

  // Get training data from the server and convert it to calendar events
  const fetchTrainings = async () => {
    try {
      // Get all trainings from the API
      const trainings = await api.getTrainings();
      
      // Convert each training into a calendar event
      const calendarEvents = trainings.map((training) => ({
        id: training.id,
        // Show activity and customer name in the event title
        title: `${training.activity} / ${training.customer.firstname} ${training.customer.lastname}`,
        start: new Date(training.date),  // When the training starts
        // Calculate end time by adding duration (in minutes) to start time
        end: new Date(new Date(training.date).getTime() + training.duration * 60000),
        customer: `${training.customer.firstname} ${training.customer.lastname}`,
      }));
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Update the calendar view when user switches between month/week/day
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', minHeight: 'calc(100vh - 180px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Training Calendar
        </Typography>
        
        {/* Optional: Buttons to switch between month/week/day views */}
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, value) => value && handleViewChange(value)}
          aria-label="calendar view"
        >
          <ToggleButton value="month" aria-label="month view">Month</ToggleButton>
          <ToggleButton value="week" aria-label="week view">Week</ToggleButton>
          <ToggleButton value="day" aria-label="day view">Day</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* The calendar itself */}
      {/* Optional: Styling for the calendar container */}
      <Box sx={{ 
        height: 'calc(100vh - 250px)',
        minHeight: 600,
        backgroundColor: 'white',
        p: 2,
        borderRadius: 1,
        // Optional: Custom styling for calendar events
        '& .rbc-event': {
          backgroundColor: theme => theme.palette.primary.main,
        },
        // Optional: Highlight today's date
        '& .rbc-today': {
          backgroundColor: theme => theme.palette.primary.light + '20',
        },
      }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={handleViewChange}
          // Show event details in tooltip on hover
          tooltipAccessor={event => `${event.title}\nDuration: ${
            Math.round((event.end.getTime() - event.start.getTime()) / 60000)
          } minutes`}
          culture="en-US"
        />
      </Box>
    </Box>
  );
};

export default CalendarPage;