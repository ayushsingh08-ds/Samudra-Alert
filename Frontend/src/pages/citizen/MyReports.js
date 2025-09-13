import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReports } from '../../contexts/ReportsContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import ReportCard from '../../components/common/ReportCard';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar
} from 'lucide-react';

const MyReports = () => {
  const { user } = useAuth();
  const { reports, fetchReports } = useReports();
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter reports for current user
  useEffect(() => {
    let userReports = reports.filter(report => 
      report.reportedBy === user?.id || report.reportedBy === user?.email?.split('@')[0]
    );

    // Apply search filter
    if (searchTerm) {
      userReports = userReports.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      userReports = userReports.filter(report => report.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      userReports = userReports.filter(report => report.type === typeFilter);
    }

    // Sort by most recent first
    userReports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

    setFilteredReports(userReports);
  }, [reports, user, searchTerm, statusFilter, typeFilter]);

  const getStatusStats = () => {
    const userReports = reports.filter(report => 
      report.reportedBy === user?.id || report.reportedBy === user?.email?.split('@')[0]
    );
    
    return {
      total: userReports.length,
      pending: userReports.filter(r => r.status === 'pending').length,
      verified: userReports.filter(r => r.status === 'verified').length,
      rejected: userReports.filter(r => r.status === 'rejected').length
    };
  };

  const stats = getStatusStats();

  const handleReportView = (report) => {
    console.log('View report:', report);
    // TODO: Open report details modal or navigate to details page
  };

  const handleReportEdit = (report) => {
    console.log('Edit report:', report);
    // TODO: Navigate to edit report page
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-1">
              Track the status of your submitted hazard reports
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="all">All Types</option>
                <option value="flood">Flooding</option>
                <option value="storm">Storm</option>
                <option value="tsunami">Tsunami</option>
                <option value="pollution">Pollution</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={handleReportView}
                onEdit={handleReportEdit}
                showActions={true}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No reports match your filters' 
                  : 'No reports yet'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Submit your first hazard report to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <button className="inline-flex items-center px-4 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit First Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyReports;