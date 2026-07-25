import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobPaymentDetails } from '../../api/admin.api';
import { ArrowLeft, DollarSign } from 'lucide-react';

const LABEL_MAP: Record<string, string> = {
  per_hour: 'Per Hour',
  per_hour_pay: 'Per Hour',
  per_day: 'Per Day',
  per_day_pay: 'Per Day',
  per_week: 'Per Week',
  per_month: 'Per Month',
  per_month_pay: 'Per Month',
  package: 'Package',
  package_pay: 'Package',
};

interface PaymentField {
  label: string;
  value: any;
}

const PAYMENT_TYPE_ALIAS: Record<string, string> = {
  per_hour: 'per_hour',
  per_hour_pay: 'per_hour',
  per_day: 'per_day',
  per_day_pay: 'per_day',
  per_week: 'per_week',
  per_month: 'per_month',
  per_month_pay: 'per_month',
  package: 'package',
  package_pay: 'package',
};

const getPaymentFields = (type: string, p: any): PaymentField[] => {
  if (!p) return [];
  const t = PAYMENT_TYPE_ALIAS[type] || type;
  switch (t) {
    case 'per_hour':
      return [
        { label: 'Hours / Day', value: p.hourPerDay },
        { label: 'Budget / Hour (AED)', value: p.hourBudgetPerHour },
        { label: 'No of Days', value: p.hourNoOfDays },
        { label: 'Commission', value: p.hourCommission },
        { label: 'Talent Budget', value: p.hourTalentBudget },
        { label: 'Profit', value: p.hourProfit },
      ];
    case 'per_day':
      return [
        { label: 'Full Day', value: p.dayFullDay },
        { label: 'Half Day', value: p.dayHalfDay },
        { label: 'Budget Full Day', value: p.dayBudgetFullDay },
        { label: 'Budget Half Day', value: p.dayBudgetHalfDay },
        { label: 'Total Budget', value: p.dayTotalBudget },
        { label: 'Commission', value: p.dayCommission },
        { label: 'Talent Full Day', value: p.dayTalentFullDay },
        { label: 'Talent Half Day', value: p.dayTalentHalfDay },
        { label: 'Talent Total', value: p.dayTalentTotal },
        { label: 'Total Profit', value: p.dayTotalProfit },
      ];
    case 'per_week':
      return [
        { label: 'No of Weeks', value: p.weekNoOfWeek },
        { label: 'Days / Week', value: p.weekDaysPerWeek },
        { label: 'Budget / Week (AED)', value: p.weekBudgetPerWeek },
        { label: 'Commission', value: p.weekCommission },
        { label: 'Talent Budget', value: p.weekTalentBudget },
        { label: 'Profit', value: p.weekProfit },
      ];
    case 'per_month':
      return [
        { label: 'No of Months', value: p.monthNoOfMonth },
        { label: 'Days / Month', value: p.monthDayPerMonth },
        { label: 'Budget / Month (AED)', value: p.monthBudgetPerMonth },
        { label: 'Commission', value: p.monthCommission },
        { label: 'Talent Budget', value: p.monthTalentBudget },
        { label: 'Profit', value: p.monthProfit },
      ];
    case 'package':
      return [
        { label: 'Budget Full Day', value: p.packageBudgetFullDay },
        { label: 'Budget Half Day', value: p.packageBudgetHalfDay },
        { label: 'Total Budget', value: p.packageTotalBudget },
        { label: 'Commission', value: p.packageCommission },
        { label: 'Total Talent', value: p.packageTotalTalent },
        { label: 'Profit', value: p.packageProfit },
      ];
    default:
      return [];
  }
};

const JobPaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJobPaymentDetails(id)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-bold text-stone-400">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-bold text-stone-400">
        Job not found
      </div>
    );
  }

  const hasPaymentRoles = data.roles?.some((r: any) => r.payment);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/jobs"
          className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-[#3835A4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="bg-white border border-stone-200 p-4 mb-6">
        <h2 className="text-lg font-black text-[#3835A4]">{data.title}</h2>
        <p className="text-xs text-stone-400 mt-1">{data.company?.companyName}</p>
        <p className="text-[10px] font-bold text-stone-500 mt-2 uppercase">
          Payment: {data.paymentInfo === 'paid' ? 'Paid' : 'Unpaid'}
        </p>
      </div>

      {!hasPaymentRoles ? (
        <div className="bg-white border border-stone-200 p-6 text-center text-sm font-bold text-stone-400">
          No payment details found for this job.
        </div>
      ) : (
        <div className="space-y-4">
          {data.roles?.map((role: any) => {
            const fields = getPaymentFields(role.paymentType, role.payment);
            if (fields.length === 0) return null;

            return (
              <div key={role.id} className="bg-white border border-stone-200">
                <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#3835A4]" />
                  <h3 className="text-sm font-bold text-stone-700">{role.title}</h3>
                  <span className="ml-auto text-[10px] font-bold text-stone-400 uppercase">
                    {LABEL_MAP[role.paymentType] || role.paymentType}
                  </span>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm">
                    <tbody>
                      {fields.map((f) =>
                        f.value != null ? (
                          <tr key={f.label} className="border-b border-stone-50 last:border-b-0">
                            <td className="py-2 pr-4 text-[10px] font-bold text-stone-400 uppercase w-48">{f.label}</td>
                            <td className="py-2 font-medium text-stone-700">{f.value} AED</td>
                          </tr>
                        ) : null,
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobPaymentDetails;
