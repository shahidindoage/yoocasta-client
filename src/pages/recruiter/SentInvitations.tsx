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
    <div style={{ background: '#f4f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '40px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111', marginBottom: '24px' }}>Sent Invitations</h2>

      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p style={{ color: '#888' }}>No invitations sent yet. Browse talents and invite them to apply.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr style={{ background: '#f9f9fb', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#888' }}>Job Title</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#888' }}>Roles</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#888' }}>Invitations Sent</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 700, color: '#222' }}>{job.title || 'Untitled Job'}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', color: '#555' }}>{job.roleCount}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <Link
                    to={`/invitation/${job.id}`}
                    style={{ color: '#3835A4', fontWeight: 700, fontSize: '14px', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    {job.invitationCount}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </RecruiterGuard>
  );
}
