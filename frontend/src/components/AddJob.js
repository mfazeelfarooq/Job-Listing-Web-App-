import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Autocomplete,
  Breadcrumbs,
  Link,
  Divider,
  useTheme,
  InputAdornment,
  IconButton,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const API_URL = 'http://localhost:5000/api';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

function AddJob() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: '',
    description: '',
    url: '',
    tags: [],
    posting_date: new Date(),
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const requiredFields = ['title', 'company', 'location', 'job_type'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    const jobData = {
      ...formData,
      posting_date: formData.posting_date.toISOString(),
      tags: JSON.stringify(formData.tags || []),
    };

    try {
      const response = await axios.post(`${API_URL}/jobs`, jobData);
      if (response.status === 201) {
        navigate('/');
      } else {
        throw new Error('Failed to create job');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to create job. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateDescription = (description) => {
    if (!description) return true;
    return description.length >= 10;
  };

  const validateTags = (tags) => {
    if (!tags || tags.length === 0) return true;
    return tags.every(tag => tag.length >= 2);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Back to Jobs
        </Link>
        <Typography color="text.primary">Add New Job</Typography>
      </Breadcrumbs>

      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: 3,
          }}
        >
          Add New Job
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                alignItems: 'center',
              },
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Job Type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                {JOB_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Posting Date"
                value={formData.posting_date}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    posting_date: newValue,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={formData.description && !validateDescription(formData.description)}
                helperText={formData.description && !validateDescription(formData.description) ? 'Description must be at least 10 characters long' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Application URL"
                name="url"
                value={formData.url}
                onChange={handleChange}
                type="url"
                error={formData.url && !validateUrl(formData.url)}
                helperText={formData.url && !validateUrl(formData.url) ? 'Please enter a valid URL' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.tags}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tags: newValue,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Skills"
                    placeholder="Add skills"
                    error={formData.tags && !validateTags(formData.tags)}
                    helperText={formData.tags && !validateTags(formData.tags) ? 'Each skill must be at least 2 characters long' : ''}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box 
                display="flex" 
                justifyContent="flex-end" 
                gap={2}
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.title || !formData.company || !formData.location || !formData.job_type}
                  sx={{
                    minWidth: 120,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {loading ? 'Creating...' : 'Create Job'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default AddJob; 