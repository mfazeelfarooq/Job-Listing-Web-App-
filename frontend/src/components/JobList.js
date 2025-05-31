import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  IconButton,
  Fade,
  Skeleton,
  Tooltip,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import debounce from 'lodash/debounce';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = 'http://localhost:5000/api';
const ITEMS_PER_PAGE = 10;

// Memoized filter options
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const SORT_OPTIONS = [
  { value: 'posting_date', label: 'Posting Date' },
  { value: 'title', label: 'Title' },
  { value: 'company', label: 'Company' },
];

function JobList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [deleteError, setDeleteError] = useState(null);
  const [filters, setFilters] = useState({
    title: '',
    company: '',
    location: '',
    job_type: '',
    sort_by: 'posting_date',
    sort_order: 'desc',
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        ...filters,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      });
      const response = await axios.get(`${API_URL}/jobs?${params}`);
      setJobs(response.data.jobs);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const debouncedFetchJobs = useCallback(
    debounce(() => {
      setCurrentPage(1);
      fetchJobs();
    }, 500),
    [fetchJobs]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    debouncedFetchJobs();
  };

  const handleClearFilter = (field) => {
    setFilters((prev) => ({
      ...prev,
      [field]: '',
    }));
    debouncedFetchJobs();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleDelete = async (jobId, event) => {
    event.stopPropagation(); // Prevent card click event
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        // Set loading state for this specific job
        setDeleteLoading(prev => ({ ...prev, [jobId]: true }));
        setDeleteError(null);

        // Optimistically remove the job from the list
        setJobs(prev => prev.filter(job => job.id !== jobId));

        // Make the API call
        await axios.delete(`${API_URL}/jobs/${jobId}`);

        // If we're on the last page and it's now empty, go to the previous page
        if (jobs.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          // Refresh the job list
          fetchJobs();
        }
      } catch (err) {
        // Revert the optimistic update
        fetchJobs();
        setDeleteError('Failed to delete job. Please try again.');
        console.error('Error deleting job:', err);
      } finally {
        setDeleteLoading(prev => ({ ...prev, [jobId]: false }));
      }
    }
  };

  const handleEdit = (jobId, event) => {
    event.stopPropagation(); // Prevent card click event
    navigate(`/jobs/${jobId}/edit`);
  };

  // Memoized filter components
  const FilterTextField = useMemo(() => ({ label, name, value, ...props }) => (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={handleFilterChange}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton onClick={() => handleClearFilter(name)} size="small">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
        },
      }}
      {...props}
    />
  ), [handleFilterChange, handleClearFilter]);

  if (loading && jobs.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Skeleton 
                variant="rectangular" 
                height={200} 
                sx={{ 
                  borderRadius: 2,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

      {deleteError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              alignItems: 'center',
            },
          }} 
          onClose={() => setDeleteError(null)}
        >
          {deleteError}
        </Alert>
      )}

      {/* Filters */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Search Jobs
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FilterTextField
              label="Job Title"
              name="title"
              value={filters.title}
              placeholder="e.g. Software Engineer"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FilterTextField
              label="Company"
              name="company"
              value={filters.company}
              placeholder="e.g. Google"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FilterTextField
              label="Location"
              name="location"
              value={filters.location}
              placeholder="e.g. New York"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Job Type"
              name="job_type"
              value={filters.job_type}
              onChange={handleFilterChange}
              size="small"
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
              <MenuItem value="">All Types</MenuItem>
              {JOB_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Sort By"
              name="sort_by"
              value={filters.sort_by}
              onChange={handleFilterChange}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Sort Order"
              name="sort_order"
              value={filters.sort_order}
              onChange={handleFilterChange}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            >
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Job Listings */}
      <Fade in={!loading}>
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} key={job.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onClick={() => handleJobClick(job.id)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                          }}
                        >
                          {job.title}
                        </Typography>
                        <Chip
                          label={job.job_type}
                          size="small"
                          sx={{
                            ml: 2,
                            backgroundColor: 'primary.light',
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Job">
                            <IconButton
                              size="small"
                              onClick={(e) => handleEdit(job.id, e)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Job">
                            <IconButton
                              size="small"
                              onClick={(e) => handleDelete(job.id, e)}
                              disabled={deleteLoading[job.id]}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                },
                              }}
                            >
                              {deleteLoading[job.id] ? (
                                <CircularProgress size={20} color="error" />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />
                          <Typography color="text.secondary">
                            {job.company}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />
                          <Typography color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />
                          <Typography color="text.secondary">
                            Posted {format(new Date(job.posting_date), 'MMM d, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        {job.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {job.skills?.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(37, 99, 235, 0.08)',
                              color: 'primary.main',
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1,
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
}

export default JobList; 