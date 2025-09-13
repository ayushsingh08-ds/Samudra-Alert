import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../contexts/ReportsContext';
import { useAlerts } from '../../contexts/AlertsContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import ReportForm from '../../components/forms/ReportForm';

const SubmitReport = () => {
  const navigate = useNavigate();
  const { addReport } = useReports();
  const { addNotification } = useAlerts();

  const handleSubmit = (reportData) => {
    try {
      // Add the report to the context
      addReport(reportData);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Report Submitted',
        message: 'Your hazard report has been submitted successfully and is pending verification.',
        severity: 'medium'
      });

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'There was an error submitting your report. Please try again.',
        severity: 'high'
      });
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <ReportForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
};

export default SubmitReport;