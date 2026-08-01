import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecruiterGuard from '../../auth/RecruiterGuard';
import { getSentInvitations } from '../../api/invitations.api';

export default function SentInvitations() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSentInvitations()
      .then(res => setJobs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <RecruiterGuard>
    <div className="bg-[#fdfbf7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-screen">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#3835A4]">Sent Invitations</h1>
              <p className="text-sm text-stone-500 font-medium mt-1">Manage the invitations you have sent to talents</p>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <span className="text-5xl block">📨</span>
              <p className="text-sm font-medium text-stone-500">No invitations sent yet</p>
              <Link
                to="/dashboard/recruiter/jobs"
                className="inline-block text-[10px] font-black bg-[#3835A4] text-white px-6 py-3 rounded-xl hover:bg-[#2a2899] transition-all"
              >
                Browse Your Jobs
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-[9px] font-black text-stone-500">
                    <th className="px-5 py-4">Job Title</th>
                    <th className="px-5 py-4">Roles</th>
                    <th className="px-5 py-4 text-right">Invitations Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {jobs.map(job => (
                    <tr key={job.id} className="text-sm hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#3835A4]">{job.title || 'Untitled Job'}</td>
                      <td className="px-5 py-4 text-stone-500">{job.roleCount} role{job.roleCount !== 1 ? 's' : ''}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/invitation/${job.id}`}
                          className="inline-block text-[9px] font-black bg-[#3835A4] text-white px-3 py-2 rounded-lg hover:bg-[#2a2899] transition-all"
                        >
                          {job.invitationCount} Invitation{job.invitationCount !== 1 ? 's' : ''}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </RecruiterGuard>
  );
}
