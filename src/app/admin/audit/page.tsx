'use client';

import { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id?: string;
  meta?: any;
  created_at: string;
  admin_id?: string;
}

interface StripeEvent {
  id: string;
  type: string;
  processed: boolean;
  created_at: string;
}

interface EmailOutbox {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

interface ApiResponse {
  auditLogs: AuditLog[];
  auditCount: number;
  stripeEvents: StripeEvent[];
  emailOutbox: EmailOutbox[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stripeEvents, setStripeEvents] = useState<StripeEvent[]>([]);
  const [emailOutbox, setEmailOutbox] = useState<EmailOutbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [page, limit, filters]);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.entity && { entity: filters.entity }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const res = await fetch(`/api/admin/audit?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch audit data');
      }

      const data: ApiResponse = await res.json();
      setAuditLogs(data.auditLogs);
      setStripeEvents(data.stripeEvents);
      setEmailOutbox(data.emailOutbox);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Audit & Health</h1>

        {/* Stripe Events Section */}
        <section className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Stripe Webhooks</h2>
            <p className="text-sm text-gray-600 mt-1">
              Recent webhook events from Stripe. Check status to confirm webhooks are landing correctly.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Event ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stripeEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No webhook events
                    </td>
                  </tr>
                ) : (
                  stripeEvents.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-mono text-xs text-gray-700">{event.id}</td>
                      <td className="px-6 py-3 text-gray-900">{event.type}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          event.processed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.processed ? 'Processed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-xs">{formatTime(event.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Email Outbox Section */}
        <section className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Email Outbox</h2>
            <p className="text-sm text-gray-600 mt-1">
              Outgoing email status. View whether customer emails are actually being sent.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">To</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Subject</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Sent</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {emailOutbox.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No outbox records
                    </td>
                  </tr>
                ) : (
                  emailOutbox.map(email => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-xs text-gray-900">{email.to_email}</td>
                      <td className="px-6 py-3 text-gray-700 truncate max-w-xs">{email.subject}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          email.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : email.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {email.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-xs">
                        {email.sent_at ? formatTime(email.sent_at) : '-'}
                      </td>
                      <td className="px-6 py-3 text-xs text-red-600 truncate max-w-xs">
                        {email.error_message || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audit Logs Section */}
        <section className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Audit Logs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Admin actions and system changes. Filter by action, entity, or date range.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <input
                  type="text"
                  placeholder="e.g., create, update, delete"
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
                <input
                  type="text"
                  placeholder="e.g., order, product"
                  value={filters.entity}
                  onChange={(e) => handleFilterChange('entity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-gray-600">Loading audit logs...</p>
              </div>
            </div>
          )}

          {/* Audit Logs Table */}
          {!loading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Entity</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Entity ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Details</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No audit logs found
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-semibold text-gray-900">{log.action}</td>
                          <td className="px-6 py-3 text-gray-700">{log.entity}</td>
                          <td className="px-6 py-3 text-gray-600 text-xs">{log.entity_id || '-'}</td>
                          <td className="px-6 py-3 text-xs text-gray-600 font-mono max-w-xs truncate">
                            {log.meta ? JSON.stringify(log.meta).slice(0, 60) + '...' : '-'}
                          </td>
                          <td className="px-6 py-3 text-gray-600 text-xs whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditLogs.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {auditLogs.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
                    {Math.min(page * limit, total)} of {total} logs
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
