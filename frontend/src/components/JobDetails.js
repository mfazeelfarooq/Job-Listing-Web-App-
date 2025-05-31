import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  IconButton,
  useTheme,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const API_URL = 'http://localhost:5000/api';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/jobs/${id}`);
      setJob(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch job details. Please try again later.');
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`${API_URL}/jobs/${id}`);
        navigate('/');
      } catch (err) {
        setError('Failed to delete job. Please try again later.');
        console.error('Error deleting job:', err);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/jobs/${id}/edit`);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              alignItems: 'center',
            },
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="info"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              alignItems: 'center',
            },
          }}
        >
          Job not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
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
        <Typography color="text.primary">Job Details</Typography>
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
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="flex-start"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={2}
            >
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                >
                  {job.title}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body1" color="text.secondary">
                      {job.company}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body1" color="text.secondary">
                      {job.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body1" color="text.secondary">
                      Posted {format(new Date(job.posting_date), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex',
                  gap: 1,
                  flexDirection: { xs: 'row', sm: 'column' },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ 
                    minWidth: { xs: 'auto', sm: 120 },
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    },
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{ 
                    minWidth: { xs: 'auto', sm: 120 },
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'white',
                    },
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Job Type and Tags */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<WorkIcon />}
                label={job.job_type}
                sx={{
                  backgroundColor: 'primary.light',
                  color: 'white',
                  fontWeight: 500,
                }}
              />
              {job.skills?.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  sx={{
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: 'primary.main',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              Job Description
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
                color: 'text.secondary',
              }}
            >
              {job.description}
            </Typography>
          </Grid>

          {/* Apply Button */}
          {job.url && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Apply Now
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default JobDetails; 