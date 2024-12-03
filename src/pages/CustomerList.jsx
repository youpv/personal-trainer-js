/**
 * Customer management page component
 * This file demonstrates:
 * - CRUD operations with REST API
 * - Material-UI DataGrid implementation
 * - Form handling with dialogs
 * - CSV export functionality
 * - Search and filtering
 */

// Import required libraries and components
import { useState, useEffect } from 'react';
import { 
  DataGrid, 
  GridActionsCellItem, 
} from '@mui/x-data-grid';
import { 
  TextField, 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Tooltip, 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'sonner';
import api from '../services/api';

/**
 * Default form data structure for new customer creation.
 * Contains empty strings for all required customer fields.
 * Used to reset the form when adding a new customer.
 */
const defaultFormData = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  streetaddress: '',
  postcode: '',
  city: '',
};

/**
 * Dialog component for adding or editing customer information.
 * Handles form state and validation for customer data.
 */
const CustomerDialog = ({ open, onClose, onSave, customer, title }) => {
  const [formData, setFormData] = useState(defaultFormData);

  // Effect to update form data when a customer is selected or dialog is opened
  useEffect(() => {
    setFormData(customer || defaultFormData);
  }, [customer, open]);

  // Function to handle changes in form fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="firstname"
              label="First Name"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
            <TextField
              name="lastname"
              label="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <TextField
              name="streetaddress"
              label="Street Address"
              value={formData.streetaddress}
              onChange={handleChange}
              required
            />
            <TextField
              name="postcode"
              label="Postcode"
              value={formData.postcode}
              onChange={handleChange}
              required
            />
            <TextField
              name="city"
              label="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

/**
 * Dialog component for adding new training sessions to a customer.
 * Provides date-time selection and training details input.
 */
const TrainingDialog = ({ open, onClose, onSave, customerUrl }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    duration: 60,
    activity: '',
  });

  // Function to handle form submission for training session
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, customer: customerUrl });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Training</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Date and Time"
                value={new Date(formData.date)}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, date: newValue.toISOString() });
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              name="duration"
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              required
            />
            <TextField
              name="activity"
              label="Activity"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

/**
 * Generic confirmation dialog for delete operations
 */
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

/**
 * Main CustomerList component that manages the customer data grid and operations
 */
const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerUrl, setSelectedCustomerUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Function to fetch customer data from the API
  // This function sets the loading state to true, attempts to fetch customer data,
  // and updates the state with the fetched data. If an error occurs, it displays an error message.
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const customers = await api.getCustomers();
      setCustomers(customers);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch customers when the component is mounted
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Function to handle adding a new customer
  // This function sends a request to add a new customer, displays a success message,
  // refreshes the customer list, and closes the customer dialog. If an error occurs, it displays an error message.
  const handleAddCustomer = async (customer) => {
    try {
      await api.addCustomer(customer);
      toast.success('Customer added successfully');
      fetchCustomers();
      setCustomerDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add customer');
      console.error('Error adding customer:', error);
    }
  };

  // Function to handle editing an existing customer
  // This function checks if a customer is selected, sends a request to update the customer,
  // displays a success message, refreshes the customer list, and closes the customer dialog.
  // If an error occurs, it displays an error message.
  const handleEditCustomer = async (customer) => {
    if (!selectedCustomer?._links?.self.href) return;
    try {
      await api.updateCustomer(selectedCustomer._links.self.href, customer);
      toast.success('Customer updated successfully');
      fetchCustomers();
      setCustomerDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast.error('Failed to update customer');
      console.error('Error updating customer:', error);
    }
  };

  // Function to handle deleting a customer
  // This function checks if a customer URL is selected, sends a request to delete the customer,
  // displays a success message, refreshes the customer list, and closes the delete dialog.
  // If an error occurs, it displays an error message.
  const handleDeleteCustomer = async () => {
    if (!selectedCustomerUrl) return;
    try {
      await api.deleteCustomer(selectedCustomerUrl);
      toast.success('Customer deleted successfully');
      fetchCustomers();
      setDeleteDialogOpen(false);
      setSelectedCustomerUrl('');
    } catch (error) {
      toast.error('Failed to delete customer');
      console.error('Error deleting customer:', error);
    }
  };

  // Function to handle adding a training session to a customer
  // This function sends a request to add a training session, displays a success message,
  // and closes the training dialog. If an error occurs, it displays an error message.
  const handleAddTraining = async (training) => {
    try {
      await api.addTraining(training);
      toast.success('Training added successfully');
      setTrainingDialogOpen(false);
      setSelectedCustomerUrl('');
    } catch (error) {
      toast.error('Failed to add training');
      console.error('Error adding training:', error);
    }
  };

  // Function to export customer data to a CSV file
  // This function constructs a CSV string from the customer data, creates a downloadable link,
  // and triggers a download of the CSV file. It displays a success message upon completion.
  const handleExportCSV = () => {
    const fields = ['firstname', 'lastname', 'email', 'phone', 'streetaddress', 'postcode', 'city'];
    const csvHeader = fields.join(',');
    const csvRows = customers.map(customer => {
      return fields.map(field => {
        const value = customer[field];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    const csvString = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'customers.csv');
      link.style.visibility = 'hidden'; // Optional: styling element
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Customers exported successfully');
    }
  };

  // Define columns for the DataGrid
  const columns = [
    { field: 'firstname', headerName: 'First Name', flex: 1 },
    { field: 'lastname', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'streetaddress', headerName: 'Address', flex: 1 },
    { field: 'postcode', headerName: 'Postcode', flex: 1 },
    { field: 'city', headerName: 'City', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit customer" arrow>
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => {
            setSelectedCustomer(params.row);
            setIsEditing(true);
            setCustomerDialogOpen(true);
          }}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete customer" arrow>
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => {
            setSelectedCustomerUrl(params.row._links.self.href);
            setDeleteDialogOpen(true);
          }}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Add training session" arrow>
              <FitnessCenterIcon />
            </Tooltip>
          }
          label="Add Training"
          onClick={() => {
            setSelectedCustomerUrl(params.row._links.self.href);
            setTrainingDialogOpen(true);
          }}
          showInMenu={false}
        />,
      ],
    },
  ];

  // Filter customers based on the search term
  const filteredCustomers = customers.filter((customer) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      customer.firstname.toLowerCase().includes(searchStr) ||
      customer.lastname.toLowerCase().includes(searchStr) ||
      customer.email.toLowerCase().includes(searchStr) ||
      customer.city.toLowerCase().includes(searchStr)
    );
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Customers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Export to CSV" arrow>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Tooltip>
          <Tooltip title="Add new customer" arrow>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setIsEditing(false);
                setSelectedCustomer(null);
                setCustomerDialogOpen(true);
              }}
            >
              Add Customer
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <TextField
        label="Search Customers"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <Box sx={{ height: 600, width: '1440px', maxWidth: '100%' }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._links.self.href}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: 'lastname', sort: 'asc' }],
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>

      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => {
          setCustomerDialogOpen(false);
          setIsEditing(false);
          setSelectedCustomer(null);
        }}
        onSave={isEditing ? handleEditCustomer : handleAddCustomer}
        customer={selectedCustomer || undefined}
        title={isEditing ? 'Edit Customer' : 'Add Customer'}
      />

      <TrainingDialog
        open={trainingDialogOpen}
        onClose={() => {
          setTrainingDialogOpen(false);
          setSelectedCustomerUrl('');
        }}
        onSave={handleAddTraining}
        customerUrl={selectedCustomerUrl}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        content="Are you sure you want to delete this customer? This will also delete all associated trainings."
      />
    </Box>
  );
};

export default CustomerList;