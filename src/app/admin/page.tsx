'use client';

import { useState, useEffect } from 'react';
import { Vendor, VendorSubmission } from '@/types/vendor';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Download,
  Upload
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'submissions'>('overview');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [submissions, setSubmissions] = useState<VendorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    pendingSubmissions: 0,
    totalSubmissions: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vendorsRes, submissionsRes] = await Promise.all([
        fetch('/api/admin/vendors'),
        fetch('/api/admin/submissions')
      ]);
      
      const vendorsData = await vendorsRes.json();
      const submissionsData = await submissionsRes.json();
      
      setVendors(vendorsData);
      setSubmissions(submissionsData);
      
      setStats({
        totalVendors: vendorsData.length,
        activeVendors: vendorsData.filter((v: Vendor) => v.status === 'Active').length,
        pendingSubmissions: submissionsData.filter((s: VendorSubmission) => s.submissionStatus === 'Pending').length,
        totalSubmissions: submissionsData.length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/approve`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/reject`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
    }
  };

  const handleUpdateVendorStatus = async (vendorId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  const exportVendors = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'City', 'State', 'Services', 'Status'].join(','),
      ...vendors.map(v => [
        v.name,
        v.phone,
        v.email,
        v.city,
        v.state,
        v.serviceTypes.join(';'),
        v.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={exportVendors}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
                <p className="text-gray-600">Total Vendors</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.activeVendors}</p>
                <p className="text-gray-600">Active Vendors</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
                <p className="text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                <p className="text-gray-600">Total Submissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'vendors'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Vendors ({stats.totalVendors})
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'submissions'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Submissions ({stats.pendingSubmissions})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Submissions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h2>
                <div className="space-y-3">
                  {submissions.slice(0, 5).map(submission => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{submission.businessName}</p>
                        <p className="text-sm text-gray-600">{submission.submittedAt}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        submission.submissionStatus === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : submission.submissionStatus === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {submission.submissionStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top States */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendors by State</h2>
                <div className="space-y-3">
                  {Object.entries(
                    vendors.reduce((acc, vendor) => {
                      acc[vendor.state] = (acc[vendor.state] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([state, count]) => (
                      <div key={state} className="flex justify-between items-center">
                        <span className="text-gray-900">{state}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-sm rounded">
                          {count} vendors
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">All Vendors</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendors.map(vendor => (
                      <tr key={vendor.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                            <p className="text-sm text-gray-500">{vendor.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {vendor.city}, {vendor.stateCode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {vendor.serviceTypes.slice(0, 2).join(', ')}
                          {vendor.serviceTypes.length > 2 && '...'}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={vendor.status}
                            onChange={(e) => handleUpdateVendorStatus(vendor.id, e.target.value)}
                            className={`text-sm rounded px-2 py-1 ${
                              vendor.status === 'Active' 
                                ? 'bg-green-100 text-green-800'
                                : vendor.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Vendor Submissions</h2>
              
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{submission.businessName}</h3>
                        <p className="text-gray-600">Contact: {submission.contactName}</p>
                        <p className="text-sm text-gray-500">Submitted: {submission.submittedAt}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded ${
                        submission.submissionStatus === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : submission.submissionStatus === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {submission.submissionStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Phone: {submission.phone}</p>
                        <p className="text-sm text-gray-600">Email: {submission.email}</p>
                        <p className="text-sm text-gray-600">Address: {submission.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Services: {submission.services.join(', ')}</p>
                        {submission.website && (
                          <p className="text-sm text-gray-600">Website: {submission.website}</p>
                        )}
                      </div>
                    </div>
                    
                    {submission.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 font-medium mb-1">Description:</p>
                        <p className="text-sm text-gray-700">{submission.description}</p>
                      </div>
                    )}
                    
                    {submission.submissionStatus === 'Pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApproveSubmission(submission.id)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectSubmission(submission.id)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}