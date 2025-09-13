export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">🌊 Samudra Alert - Admin</h1>
          <div className="text-sm sm:text-lg">Welcome, {user?.name}</div>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">User Management</h2>
            <p className="text-gray-600 text-sm sm:text-base">Manage system users and permissions</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">System Settings</h2>
            <p className="text-gray-600 text-sm sm:text-base">Configure system parameters and alerts</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h2>
            <p className="text-gray-600 text-sm sm:text-base">View system-wide analytics and metrics</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Monitoring</h2>
            <p className="text-gray-600 text-sm sm:text-base">Monitor system health and performance</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Backup & Recovery</h2>
            <p className="text-gray-600 text-sm sm:text-base">Manage data backup and recovery</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Notifications</h2>
            <p className="text-gray-600 text-sm sm:text-base">Configure system notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}