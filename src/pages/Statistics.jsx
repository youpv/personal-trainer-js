import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { groupBy, sumBy } from 'lodash';
import { toast } from 'sonner';
import api from '../services/api';

// These margins control the spacing around the chart
// Optional: You can adjust these values to change the chart's padding
const CHART_MARGINS = { top: 20, right: 30, left: 40, bottom: 5 };

// Main component that shows a bar chart of training statistics
const StatisticsPage = () => {
  // stats: holds the processed training data for the chart
  // loading: tracks whether we're still loading data from the server
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // When the component first loads, fetch the training data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get all trainings from the API
        const trainings = await api.getTrainings();
        
        // Group trainings by activity type (e.g., "Running", "Swimming", etc.)
        // This creates an object where each key is an activity and the value is an array of trainings
        const groupedStats = groupBy(trainings, 'activity');
        
        // Transform the grouped data into a format the chart can use
        // For each activity, calculate the total duration of all trainings
        const activityStats = Object.entries(groupedStats).map(([activity, trainings]) => ({
          activity,
          duration: sumBy(trainings, 'duration'),
        }));
        
        // Sort activities by duration (highest to lowest) and update the state
        setStats(activityStats.sort((a, b) => b.duration - a.duration));
      } catch (error) {
        // If something goes wrong, log the error and show a toast notification
        console.error('Error fetching training statistics:', error);
        toast.error('Failed to load statistics');
      } finally {
        // Whether successful or not, we're done loading
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format the tooltip text that appears when hovering over bars
  // Shows duration in minutes
  const tooltipFormatter = (value) => [`${value} min`, 'Duration'];

  // The chart configuration is wrapped in useMemo to prevent unnecessary re-renders
  // It will only re-render when the stats data changes
  const chartContent = useMemo(() => (
    // ResponsiveContainer makes the chart resize with its parent container
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={stats}
        margin={CHART_MARGINS}
      >
        {/* Optional: Grid lines in the background */}
        <CartesianGrid strokeDasharray="3 3" />
        
        {/* X-axis shows activity names */}
        <XAxis 
          dataKey="activity"
          tick={{ fill: '#334155' }}  // Optional: Color of the axis labels
        />
        
        {/* Y-axis shows duration values */}
        <YAxis
          label={{ 
            value: 'Duration (min)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: '#334155' }  // Optional: Color of the axis label
          }}
          tick={{ fill: '#334155' }}  // Optional: Color of the axis ticks
        />
        
        {/* Tooltip appears when hovering over bars */}
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
          }}
          formatter={tooltipFormatter}
        />
        
        {/* The actual bars in the chart */}
        <Bar 
          dataKey="duration" 
          fill="#2563eb"  // Optional: Color of the bars
          radius={[4, 4, 0, 0]}  // Optional: Rounded corners on top of bars
        />
      </BarChart>
    </ResponsiveContainer>
  ), [stats]);

  // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        minHeight: 400 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Main component layout
  return (
    <Box sx={{ height: '100%', minHeight: 'calc(100vh - 180px)' }}>
      <Typography variant="h4" gutterBottom>
        Training Statistics
      </Typography>
      
      {/* Optional: Container styling for the chart */}
      <Box sx={{ 
        height: 'calc(100vh - 250px)',
        minHeight: 600,
        backgroundColor: 'white',
        p: 4,
        borderRadius: 1,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
          Total Minutes by Activity
        </Typography>
        {chartContent}
      </Box>
    </Box>
  );
};

export default StatisticsPage;