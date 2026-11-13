import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import type { ScreeningResult } from '../types';

export const HistoryPage: React.FC = () => {
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState<'all' | 'healthy' | 'dr'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getScreenings();
      setScreenings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve screening history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this screening record?')) return;

    setDeletingId(id);
    try {
      await api.deleteScreening(id);
      setScreenings((prev) => prev.filter((s) => s.screening_id !== id));
    } catch (err: any) {
      alert(`Could not delete record: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered List
  const filtered = screenings.filter((s) => {
    // Search filter
    const refMatch =
      s.patient_info?.reference_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.screening_id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!refMatch) return false;

    // Result filter
    if (filterResult === 'healthy') return s.prediction?.class_index === 0;
    if (filterResult === 'dr') return s.prediction?.class_index === 1;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#183F35] uppercase tracking-wide">
            <History className="w-4 h-4 text-[#183F35]" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#202923] tracking-tight">Screening History Records</h1>
          <p className="text-xs text-[#737B75]">
            Review, inspect, and manage prior retinal screening evaluations executed during this session.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#E6E8E2] text-[#737B75] hover:text-[#183F35] hover:bg-[#F7F7F3] transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/screening"
            className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Screening</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#737B75] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Ref ID or UUID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F7F3] border border-[#E6E8E2] rounded-xl pl-10 pr-4 py-2 text-xs text-[#202923] focus:outline-none focus:ring-2 focus:ring-[#183F35]/20 focus:border-[#183F35]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#737B75]" />
          <div className="flex items-center space-x-1 text-xs">
            {(['all', 'healthy', 'dr'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterResult(mode)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  filterResult === mode
                    ? 'bg-[#183F35] text-white'
                    : 'text-[#737B75] hover:bg-[#F7F7F3] hover:text-[#202923]'
                }`}
              >
                {mode === 'all' ? 'All' : mode === 'healthy' ? 'Healthy' : 'DR Detected'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table / List View */}
      <div className="bg-[#FFFFFF] border border-[#E6E8E2] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#737B75] space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#183F35]" />
            <p>Loading historical records…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-700 space-y-3">
            <p>{error}</p>
            <button
              onClick={fetchRecords}
              className="px-4 py-2 bg-[#183F35] text-white text-xs font-bold rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F3] flex items-center justify-center text-[#737B75] mx-auto">
              <History className="w-6 h-6 text-[#183F35]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#202923]">No matching screening records</h3>
              <p className="text-xs text-[#737B75]">
                {screenings.length === 0
                  ? 'Perform your first evaluation to start accumulating audit records.'
                  : 'Try adjusting your search criteria or filter tags.'}
              </p>
            </div>
            {screenings.length === 0 && (
              <Link
                to="/app/screening"
                className="inline-flex items-center space-x-2 bg-[#183F35] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start First Screening</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F3] border-b border-[#E6E8E2] text-[#737B75] uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3.5">Reference ID / UUID</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Diagnostic Result</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5">Quality Gate</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8E2]">
                {filtered.map((item) => {
                  const isDR = item.prediction?.class_index === 1;
                  const isHealthy = item.prediction?.class_index === 0;
                  const confidence = item.prediction
                    ? (item.prediction.confidence * 100).toFixed(1)
                    : 'N/A';

                  return (
                    <tr key={item.screening_id} className="hover:bg-[#F7F7F3]/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-[#202923]">
                        {item.patient_info?.reference_id ? (
                          <div>
                            <span className="font-bold text-[#183F35] block">
                              {item.patient_info.reference_id}
                            </span>
                            <span className="text-[10px] text-[#737B75]">
                              {item.screening_id.slice(0, 8)}…
                            </span>
                          </div>
                        ) : (
                          <span>{item.screening_id.slice(0, 12)}…</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[#737B75]">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isHealthy
                              ? 'bg-emerald-50 text-[#2D7A4F] border border-emerald-200'
                              : isDR
                              ? 'bg-amber-50 text-[#B8860B] border border-amber-200'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.prediction?.label || 'Quality Rejected'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-[#202923]">
                        {confidence}%
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.image_quality?.status === 'suitable'
                              ? 'bg-emerald-100 text-[#2D7A4F]'
                              : item.image_quality?.status === 'uncertain'
                              ? 'bg-amber-100 text-[#B8860B]'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.image_quality?.status || 'N/A'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/app/screening/${item.screening_id}/result`}
                          state={{ screening: item }}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-[#183F35] hover:text-[#315D4D] bg-[#DCE6DE]/40 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.screening_id)}
                          disabled={deletingId === item.screening_id}
                          className="inline-flex items-center p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete screening record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="p-4 border-t border-[#E6E8E2] bg-[#F7F7F3] text-xs text-[#737B75] flex justify-between items-center">
            <span>Showing {filtered.length} of {screenings.length} records</span>
            <span className="text-[11px]">In-memory session storage</span>
          </div>
        )}
      </div>
    </div>
  );
};

