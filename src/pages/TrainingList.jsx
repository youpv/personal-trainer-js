// Import required libraries and components
import { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '../services/api';

// Simple dialog that asks for confirmation before deleting
// Used for both customer and training deletions
const DeleteConfirmDialog = ({ open, onClose, onConfirm, title, content }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{content}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
    </DialogActions>
  </Dialog>
);

// Main component that shows a list of all training sessions
const TrainingList = () => {
  // Store all our data and UI state
  const [trainings, setTrainings] = useState([]);  // List of all trainings
  const [loading, setLoading] = useState(true);    // Whether we're loading data
  const [searchTerm, setSearchTerm] = useState(''); // Text to filter trainings
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);  // Show/hide delete dialog
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);  // ID of training to delete

  // Load training data when component first renders
  useEffect(() => {
    fetchTrainings();
  }, []);

  // Get training data from the server
  const fetchTrainings = async () => {
    try {
      const data = await api.getTrainings();
      setTrainings(data);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast.error('Failed to load training sessions');
    } finally {
      setLoading(false);
    }
  };

  // Delete a training session after confirmation
  const handleDeleteTraining = async () => {
    if (!selectedTrainingId) return;
    try {
      await api.deleteTraining(selectedTrainingId);
      await fetchTrainings();  // Reload the list after deletion
      setDeleteDialogOpen(false);
      setSelectedTrainingId(null);
      toast.success('Training session deleted successfully');
    } catch (error) {
      console.error('Error deleting training:', error);
      toast.error('Failed to delete training session');
    }
  };

  // Define how each column should be displayed in the grid
  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      // Format the date to be readable
      renderCell: (params) => {
        try {
          const date = new Date(params.row.date);
          return format(date, 'dd.MM.yyyy HH:mm');
        } catch {
          return 'Invalid date';
        }
      },
    },
    { field: 'duration', headerName: 'Duration (min)', flex: 1 },
    { field: 'activity', headerName: 'Activity', flex: 1 },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      // Show customer's full name
      renderCell: (params) => {
        const customer = params.row?.customer;
        if (!customer) return 'N/A';
        return `${customer.firstname} ${customer.lastname}`;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      // Add delete button for each row
      getActions: (params) => [
        <Tooltip title="Delete training session" arrow>
          <span>
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => {
                setSelectedTrainingId(params.row.id);
                setDeleteDialogOpen(true);
              }}
              showInMenu={false}
            />
          </span>
        </Tooltip>,
      ],
    },
  ];

  // Filter trainings based on search text
  // Looks for matches in activity name or customer name
  const filteredTrainings = trainings.filter((training) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      training.activity.toLowerCase().includes(searchStr) ||
      (training.customer && 
        `${training.customer.firstname} ${training.customer.lastname}`
          .toLowerCase()
          .includes(searchStr))
    );
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trainings
      </Typography>
      
      {/* Search box to filter trainings */}
      <TextField
        label="Search Trainings"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {/* Grid showing all trainings */}
      {/* Optional: Container styling */}
      <Box sx={{ height: 600, width: '1440px', maxWidth: '100%' }}>
        <DataGrid
          rows={filteredTrainings}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },  // Show 10 items per page by default
            },
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],  // Sort by date descending
            },
          }}
          pageSizeOptions={[5, 10, 25]}  // Let users choose how many items per page
          disableRowSelectionOnClick
        />
      </Box>

      {/* Dialog that shows up when deleting a training */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTraining}
        title="Delete Training"
        content="Are you sure you want to delete this training session?"
      />
    </Box>
  );
};

export default TrainingList;