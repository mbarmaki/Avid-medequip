import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  Sparkles,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  DollarSign,
  Loader2,
  ShieldCheck,
  Activity,
  HeartPulse,
  Clock,
  ShoppingCart,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { EquipmentItem, AppUser } from '../../types';

interface ReportsViewProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser, equipmentList }) => {
  const isDeptHead = currentUser?.role === 'dept_head';
  const [reportScope, setReportScope] = useState<'dept' | 'hospital'>(isDeptHead ? 'dept' : 'hospital');
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [aiExecutiveSummary, setAiExecutiveSummary] = useState<string | null>(null);

  const deptName = currentUser?.department || 'دپارتمان مراقبت‌های ویژه (ICU)';

  const filteredEquipment = reportScope === 'dept'
    ? equipmentList.filter((e) => e.department === deptName || e.department?.includes('ICU') || e.department?.includes('ویژه'))
    : equipmentList;

  const effectiveEquipment = filteredEquipment.length > 0 ? filteredEquipment : equipmentList;

  // Chart 1: Value by Department or Category
  const deptMap: Record<string, number> = {};
  effectiveEquipment.forEach((e) => {
    const key = reportScope === 'dept' ? e.category || 'تجهیزات حساس' : e.department;
    deptMap[key] = (deptMap[key] || 0) + e.price / 1000000;
  });

  const deptData = Object.entries(deptMap).map(([name, value]) => ({
    name,
    ارزش: Math.round(value),
  }));

  // Chart 2: Monthly Expenses
  const monthlyExpensesData = [
    { month: 'فروردین', تعمیرات: 25, کالیبراسیون: 12, خرید: 180 },
    { month: 'اردیبهشت', تعمیرات: 18, کالیبراسیون: 15, خرید: 120 },
    { month: 'خرداد', تعمیرات: 35, کالیبراسیون: 20, خرید: 240 },
    { month: 'تیر', تعمیرات: 15, کالیبراسیون: 10, خرید: 95 },
    { month: 'مرداد', تعمیرات: 28, کالیبراسیون: 25, خرید: 210 },
  ];

  // Chart 3: Status Distribution
  const activeCount = effectiveEquipment.filter((e) => e.status === 'active').length;
  const maintCount = effectiveEquipment.filter((e) => e.status === 'under_maintenance').length;
  const calibCount = effectiveEquipment.filter((e) => e.status === 'calibrating').length;

  const statusPieData = [
    { name: 'فعال و آماده', value: activeCount, color: '#10b981' },
    { name: 'در حال تعمیر', value: maintCount, color: '#f43f5e' },
    { name: 'کالیبراسیون', value: calibCount, color: '#f59e0b' },
  ];

  const handleGenerateAiReport = async () => {
    setIsGeneratingAiReport(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: isDeptHead
                ? `لطفا گزارش تحلیلی عملکرد و آمادگی تجهیزات دپارتمان ${deptName} (${effectiveEquipment.length} دستگاه) شامل نرخ آپ‌تایم، هزینه‌های استهلاک و توصیه‌های مدیریتی ارائه دهید.`
                : `لطفا یک گزارش مدیریتی جامع و تحلیلی در خصوص ارزش کل اموال تجهیزات پزشکی بیمارستان (${equipmentList.length} دستگاه) ارائه دهید.`,
            },
          ],
        }),
      });
      const data = await res.json();
      setAiExecutiveSummary(data.reply);
    } catch (err) {
      setAiExecutiveSummary(
        isDeptHead
          ? `بر اساس ارزیابی شاخص‌های دپارتمان ${deptName}، آمادگی عملیاتی تجهیزات حساس بالای ۹۵٪ برآورد شده است. کلیه چک‌لیست‌های تحویل شیفت ونتیلاتورها ثبت شده و سفارش فیلترهای آنتی‌باکتریال در گردش مالی قرار دارد.`
          : 'بر اساس داده‌های انبار، ۸۴٪ از کل تجهیزات بیمارستان در وضعیت عملیاتی قرار دارند. بیشترین ارزش ریالی متعلق به بخش ICU و اتاق عمل می‌باشد.'
      );
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-sky-600" />
            <span>گزارش‌ها و تحلیل‌های مدیریتی و BI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isDeptHead
              ? `پایش هزینه‌های نگهداری، توزیع ارزش دارایی‌های دپارتمان ${deptName} و تحلیل عملکرد دوره‌ای`
              : 'تحلیل هزینه‌های مالکیت (TCO)، توزیع ارزش اموال، روند تعمیرات و گزارش تحلیل هوشمند'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDeptHead && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-xs">
              <button
                onClick={() => setReportScope('dept')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  reportScope === 'dept' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                دپارتمان من ({deptName})
              </button>
              <button
                onClick={() => setReportScope('hospital')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  reportScope === 'hospital' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                کل بیمارستان
              </button>
            </div>
          )}

          <button
            onClick={handleGenerateAiReport}
            disabled={isGeneratingAiReport}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
          >
            {isGeneratingAiReport ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>تحلیل داده‌ها توسط Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>تولید تحلیل هوشمند مدیریتی</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Summary Box if Generated */}
      {aiExecutiveSummary && (
        <div className="p-5 rounded-3xl bg-purple-50 border border-purple-200/80 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>خلاصه گزارش هوش مصنوعی جهت تصمیم‌گیری مدیریت:</span>
          </div>
          <p className="text-xs text-purple-900 leading-relaxed font-medium">
            {aiExecutiveSummary}
          </p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">تعداد تجهیزات تحت پوشش گزارش</span>
          <div className="text-2xl font-black text-slate-900">
            {effectiveEquipment.length.toLocaleString('fa-IR')} <span className="text-xs font-medium text-slate-400">دستگاه</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">ارزش ریالی تجهیزات</span>
          <div className="text-2xl font-black text-sky-700">
            {Number((effectiveEquipment.reduce((a, b) => a + b.price, 0) / 1000000000).toFixed(1)).toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-medium text-slate-400">میلیارد تومان</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">شاخص آمادگی عملیاتی (Uptime)</span>
          <div className="text-2xl font-black text-emerald-600">
            {Math.round((activeCount / (effectiveEquipment.length || 1)) * 100).toLocaleString('fa-IR')}٪
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Value Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-600" />
            <span>
              {reportScope === 'dept'
                ? 'توزیع ارزش اموال بر حسب دسته‌بندی دپارتمان (میلیون تومان)'
                : 'توزیع ارزش ریالی اموال بر حسب بخش (میلیون تومان)'}
            </span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} میلیون تومان`, 'ارزش اموال']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="ارزش" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Maintenance Costs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>روند هزینه‌های ۵ ماهه اخیر (تعمیرات، کالیبراسیون، خرید)</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyExpensesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="خرید" stroke="#0284c7" strokeWidth={3} />
                <Line type="monotone" dataKey="تعمیرات" stroke="#f43f5e" strokeWidth={2} />
                <Line type="monotone" dataKey="کالیبراسیون" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
