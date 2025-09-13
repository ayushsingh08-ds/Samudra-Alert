import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Box,
  Chip,
  IconButton,
  Badge,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Analytics,
  Assessment,
  VerifiedUser,
  Warning,
  Notifications,
  Timeline,
  TrendingUp,
  Science
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const analystTheme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',
      dark: '#0d47a1',
      light: '#5e92f3',
    },
    secondary: {
      main: '#00897b',
      dark: '#00695c',
      light: '#4db6ac',
    },
    background: {
      default: '#f0f4f8',
      paper: '#ffffff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

export default function AnalystDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const analyticsCards = [
    {
      id: 1,
      title: '📊 Advanced Data Analytics',
      description: 'Analyze complex oceanographic datasets using AI-powered tools and statistical models',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: 'primary',
      gradient: 'linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)',
      stats: '127 datasets analyzed',
      progress: 85
    },
    {
      id: 2,
      title: '📋 Report Verification',
      description: 'Review, verify, and categorize citizen-submitted hazard reports with expert analysis',
      icon: <VerifiedUser sx={{ fontSize: 40 }} />,
      color: 'success',
      gradient: 'linear-gradient(45deg, #2e7d32 30%, #1b5e20 90%)',
      stats: '43 reports pending',
      progress: 67
    },
    {
      id: 3,
      title: '⚠️ Alert System Management',
      description: 'Create, manage, and broadcast official ocean hazard alerts to affected communities',
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: 'warning',
      gradient: 'linear-gradient(45deg, #f57c00 30%, #e65100 90%)',
      stats: '12 active alerts',
      progress: 92
    },
    {
      id: 4,
      title: '📈 Trend Analysis',
      description: 'Identify patterns and trends in oceanographic data to predict future hazards',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: 'info',
      gradient: 'linear-gradient(45deg, #0288d1 30%, #01579b 90%)',
      stats: '8 trends identified',
      progress: 73
    },
    {
      id: 5,
      title: '🔬 Research Tools',
      description: 'Access advanced research tools and collaborate with marine scientists worldwide',
      icon: <Science sx={{ fontSize: 40 }} />,
      color: 'secondary',
      gradient: 'linear-gradient(45deg, #00897b 30%, #00695c 90%)',
      stats: '5 research projects',
      progress: 58
    },
    {
      id: 6,
      title: '📊 Performance Metrics',
      description: 'Monitor system performance and generate comprehensive analytical reports',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: 'primary',
      gradient: 'linear-gradient(45deg, #5e35b1 30%, #4527a0 90%)',
      stats: '99.8% system uptime',
      progress: 95
    }
  ];

  return (
    <ThemeProvider theme={analystTheme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f4f8 100%)' }}>
        {/* Analyst AppBar */}
        <AppBar position="static" elevation={0} sx={{ 
          background: 'linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)',
          backdropFilter: 'blur(10px)'
        }}>
          <Toolbar>
            <Timeline sx={{ mr: 2, fontSize: 30 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              🌊 Samudra Alert - Data Analyst
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit">
                <Badge badgeContent={7} color="secondary">
                  <Notifications />
                </Badge>
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Welcome, {user?.name || 'Analyst'}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Welcome Section */}
          <Paper elevation={4} sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
              🔬 Advanced Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Access powerful tools for oceanographic data analysis, hazard verification, and predictive modeling.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Data Scientist" color="primary" variant="filled" />
              <Chip label="Expert Level" color="success" variant="outlined" />
              <Chip label="127 Analyses Completed" color="info" variant="outlined" />
            </Box>
          </Paper>

          {/* Analytics Tools Grid */}
          <Grid container spacing={4}>
            {analyticsCards.map((card) => (
              <Grid item xs={12} sm={6} lg={4} key={card.id}>
                <Card elevation={8} sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Gradient overlay */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: card.gradient
                  }} />
                  
                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 3, 
                        background: card.gradient,
                        color: 'white',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {card.icon}
                      </Box>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {card.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {card.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={card.progress}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: card.gradient,
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>

                    <Chip 
                      label={card.stats} 
                      size="small" 
                      color={card.color}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      sx={{
                        background: card.gradient,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: `0 4px 20px ${card.color === 'primary' ? 'rgba(21, 101, 192, 0.3)' : 'rgba(0,0,0,0.2)'}`,
                        '&:hover': {
                          boxShadow: `0 6px 25px ${card.color === 'primary' ? 'rgba(21, 101, 192, 0.4)' : 'rgba(0,0,0,0.3)'}`,
                        }
                      }}
                    >
                      Launch Tool
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}