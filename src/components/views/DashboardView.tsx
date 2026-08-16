import React from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  Bell,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ArrowUpRight,
  Package,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
  Sparkles,
  ChevronLeft,
  Boxes,
  QrCode,
  Archive,
  ClipboardList,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  EquipmentItem,
  TaskEvent,
  CalibrationRecord,
  FailureReport,
  PurchaseRequest,
  PageId,
  AppUser,
} from '../../types';
import { DeptHeadDashboardView } from './DeptHeadDashboardView';

interface DashboardViewProps {
  currentUser?: AppUser;
  equipmentList: EquipmentItem[];
  tasksList: TaskEvent[];
  calibrationsList: CalibrationRecord[];
  failuresList?: FailureReport[];
  purchaseRequests: PurchaseRequest[];
  usersList?: AppUser[];
  setActivePage: (page: PageId) => void;
  onSelectEquipment?: (item: EquipmentItem) => void;
  onNavigateToInventoryWithAction?: (params: {
    initialTab?: 'drafts' | 'inventory';
    initialLayout?: 'grouped' | 'individual' | 'tree';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'low_stock' | 'asset_transfer' | 'purchase_approval';
      title: string;
      description: string;
      targetDraftId?: string;
    } | null;
    openAssetTransferModal?: boolean;
    openQuickRestockModal?: boolean;
  }) => void;
  onToggleTaskStatus?: (taskId: string) => void;
  onApproveRequest: (id: string) => void;
  onOpenAIChat: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  equipmentList,
  tasksList,
  calibrationsList,
  failuresList = [],
  purchaseRequests,
  usersList = [],
  setActivePage,
  onSelectEquipment,
  onNavigateToInventoryWithAction,
  onToggleTaskStatus,
  onApproveRequest,
  onOpenAIChat,
}) => {
  if (currentUser?.role === 'dept_head') {
    return (
      <DeptHeadDashboardView
        currentUser={currentUser}
        equipmentList={equipmentList}
        tasksList={tasksList}
        calibrationsList={calibrationsList}
        failuresList={failuresList}
        purchaseRequests={purchaseRequests}
        usersList={usersList}
        setActivePage={setActivePage}
        onSelectEquipment={onSelectEquipment}
        onToggleTaskStatus={onToggleTaskStatus}
        onOpenAIChat={onOpenAIChat}
      />
    );
  }
  // Key Statistics Calculations
  const totalEquipment = equipmentList.length;
  const activeCount = equipmentList.filter((e) => e.status === 'active').length;
  const maintenanceCount = equipmentList.filter(
    (e) => e.status === 'under_maintenance' || e.status === 'calibrating'
  ).length;
  const draftCount = equipmentList.filter((e) => e.isDraft).length;

  const totalValueToman = equipmentList.reduce((acc, curr) => acc + curr.price, 0);

  const expiringCalibrations = calibrationsList.filter(
    (c) => c.status === 'expiring_soon' || c.status === 'expired'
  );

  const pendingRequests = purchaseRequests.filter(
    (r) => r.status !== 'approved' && r.status !== 'purchased' && r.status !== 'rejected'
  );

  // Sample Chart Data
  const monthlyConsumptionData = [
    { month: 'آبان', consumption: 340, purchase: 420 },
    { month: 'آذر', consumption: 390, purchase: 380 },
    { month: 'دی', consumption: 410, purchase: 510 },
    { month: 'بهمن', consumption: 460, purchase: 490 },
    { month: 'اسفند', consumption: 580, purchase: 720 },
    { month: 'فروردین', consumption: 320, purchase: 310 },
    { month: 'اردیبهشت', consumption: 480, purchase: 650 },
    { month: 'خرداد', consumption: 520, purchase: 580 },
    { month: 'تیر', consumption: 610, purchase: 690 },
    { month: 'مرداد', consumption: 590, purchase: 710 },
  ];

  const wardDistribution = [
    { ward: 'ICU مرکزی', count: 18, color: '#0284c7' },
    { ward: 'اورژانس', count: 24, color: '#0d9488' },
    { ward: 'اتاق عمل', count: 16, color: '#8b5cf6' },
    { ward: 'رادیولوژی', count: 9, color: '#f59e0b' },
    { ward: 'قلب و عروق', count: 12, color: '#ec4899' },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans dir-rtl text-right">
      {/* 1. TOP HERO BANNER CARD (معرفی سامانه و دسترسی سریع) */}
      <div
        style={{
          paddingTop: '24px',
          paddingBottom: '24px',
          marginRight: '0px',
          marginBottom: '19px',
          marginTop: '0px',
          minHeight: '146px',
        }}
        className="bg-gradient-to-r from-[#eaf0ff] via-[#eef4ff] to-[#f4f7fe] rounded-3xl px-6 border border-blue-100/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            سامانه هوشمند مدیریت تجهیزات و ملزومات پزشکی
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            دسترسی سریع به شناسه اموال، استعلام هوشمند انبار، تقویم کالیبراسیون و مدیریت پیشگیرانه.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setActivePage('inventory')}
              className="px-6 py-2.5 rounded-full bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-extrabold shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              مدیریت انبار و موجودی
            </button>
            <button
              onClick={onOpenAIChat}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#2b64f6] border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              تحلیل هوشمند داده‌ها
            </button>
          </div>
        </div>

        {/* Decorative Graphic Area */}
        <div className="shrink-0 flex items-center justify-center relative">
          <div
            style={{
              height: '117px',
              width: '126px',
            }}
            className="rounded-3xl bg-white/80 backdrop-blur-md p-3 border border-blue-100 shadow-lg flex flex-col items-center justify-center text-center space-y-1.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2b64f6] text-white flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">
              آوید مد+
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              آنلاین
            </span>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT (Left Content + Right Profile/Metrics Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart + Quick Counter Action Cards Grid */}
          <div className="bg-white rounded-3xl p-6 border border-blue-50 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-800">
                  روند گردش فعالیت و انبار تجهیزات
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  گزارش مصرف و خروجی کالای ماهانه
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  مرداد ۱۴۰۵
                </span>
              </div>
            </div>

            {/* Chart + Action Cards Subgrid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Curve Chart (8 cols) */}
              <div className="md:col-span-8 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyConsumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGoDoc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2b64f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2b64f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                        direction: 'rtl',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="consumption"
                      name="گردش انبار"
                      stroke="#2b64f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorGoDoc)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* GoDoc+ Action Counter Pills (4 cols) */}
              <div className="md:col-span-4 space-y-3">
                {/* Item 1 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2b64f6] flex items-center justify-center font-bold text-xs shrink-0">
                      {draftCount + 8}
                    </div>
                    <span className="text-xs font-bold text-slate-700">تجهیزات جدید</span>
                  </div>
                  <button
                    onClick={() => setActivePage('inventory')}
                    className="px-2.5 py-1 rounded-full bg-[#2b64f6] hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                  >
                    + افزودن
                  </button>
                </div>

                {/* Item 2 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {tasksList.length}
                    </div>
                    <span className="text-xs font-bold text-slate-700">چک‌لیست و وظیفه</span>
                  </div>
                  <button
                    onClick={() => setActivePage('tasks')}
                    className="px-2.5 py-1 rounded-full bg-[#2b64f6] hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                  >
                    + افزودن
                  </button>
                </div>

                {/* Item 3 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {expiringCalibrations.length + 2}
                    </div>
                    <span className="text-xs font-bold text-slate-700">هشدار ایمنی</span>
                  </div>
                  <button
                    onClick={() => setActivePage('calibration')}
                    className="px-2.5 py-1 rounded-full bg-[#2b64f6] hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                  >
                    بررسی
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity / Inventory Transactions Table (GoDoc+ Table Style) */}
          <div className="bg-white rounded-3xl p-6 border border-blue-50 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">
                آخرین فعالیت‌ها و گردش اقلام انبار
              </h3>
              <button
                onClick={() => setActivePage('inventory')}
                className="text-xs text-[#2b64f6] font-bold hover:underline"
              >
                مشاهده همه
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100">
                    <th className="pb-3 pr-2">کد / عنوان کالا</th>
                    <th className="pb-3">دسته‌بندی</th>
                    <th className="pb-3">تعداد / مقدار</th>
                    <th className="pb-3">بخش / دپارتمان</th>
                    <th className="pb-3">تاریخ</th>
                    <th className="pb-3 text-center">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipmentList.slice(0, 5).map((item, idx) => {
                    const initials = item.faName.slice(0, 2);
                    const colorVariants = [
                      'bg-blue-100 text-[#2b64f6]',
                      'bg-indigo-100 text-indigo-600',
                      'bg-emerald-100 text-emerald-600',
                      'bg-amber-100 text-amber-600',
                      'bg-purple-100 text-purple-600',
                    ];
                    const avatarColor = colorVariants[idx % colorVariants.length];

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 pr-2 font-bold text-slate-800 flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center font-extrabold text-[11px] shrink-0`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div>{item.faName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.code}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 font-medium">{item.category}</td>
                        <td className="py-3 font-extrabold text-slate-800">
                          {(item.quantity || 1).toLocaleString('fa-IR')} {item.unit || 'عدد'}
                        </td>
                        <td className="py-3 text-slate-600">{item.department}</td>
                        <td className="py-3 text-slate-400 font-mono">۱۵ مرداد</td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                              item.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.status === 'active' ? 'تکمیل شده' : 'در حال بررسی'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METRICS PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-blue-50 shadow-xs space-y-6">
            {/* Key Stats Row */}
            <div className="grid grid-cols-2 gap-4 text-center border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <span className="text-xl font-black text-slate-800 block">
                  {activeCount.toLocaleString('fa-IR')}
                </span>
                <span className="text-[11px] font-bold text-slate-400 block">
                  تجهیزات فعال
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-black text-slate-800 block">
                  {totalEquipment.toLocaleString('fa-IR')}
                </span>
                <span className="text-[11px] font-bold text-slate-400 block">
                  کل اقلام انبار
                </span>
              </div>
            </div>

            {/* Real Hospital Sub-metrics */}
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-5 font-bold">
              <span className="text-[#2b64f6]">
                • {calibrationsList.length.toLocaleString('fa-IR')} کالیبراسیون فعال
              </span>
              <span className="text-amber-600">
                • {maintenanceCount.toLocaleString('fa-IR')} نیاز به سرویس
              </span>
            </div>

            {/* Bottom Circular Progress Ring Gauge (GoDoc+ Style Ring Chart) */}
            <div className="text-center space-y-3 pt-2">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* SVG Ring Gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-blue-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#2b64f6]"
                    strokeDasharray="85, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-800 leading-none">
                    {totalEquipment.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">
                    تجهیزات ثبت‌شده
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Alerts & Notifications Box (کادر اعلان‌ها و هشدارهای هوشمند متناسب با نقش) */}
          <div className="bg-white rounded-3xl p-6 border border-blue-50 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {currentUser?.role === 'asset_manager' || currentUser?.role === 'warehouse_keeper'
                      ? 'اعلان‌ها و هشدارهای اموال و انبار'
                      : currentUser?.role === 'finance_manager'
                      ? 'اعلان‌ها و هشدارهای مالی و بودجه'
                      : currentUser?.role === 'procurement_officer'
                      ? 'اعلان‌ها و هشدارهای خرید و تدارکات'
                      : currentUser?.role === 'biomedical_engineer' || currentUser?.role === 'support_tech'
                      ? 'اعلان‌ها و هشدارهای فنی و مهندسی'
                      : 'اعلان‌ها و هشدارهای هوشمند'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    رویدادهای نیازمند توجه فوری
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                {currentUser?.role === 'asset_manager' || currentUser?.role === 'warehouse_keeper'
                  ? (draftCount + 2).toLocaleString('fa-IR') + ' مورد'
                  : currentUser?.role === 'finance_manager'
                  ? (pendingRequests.length + 2).toLocaleString('fa-IR') + ' مورد'
                  : currentUser?.role === 'procurement_officer'
                  ? (pendingRequests.length + 1).toLocaleString('fa-IR') + ' مورد'
                  : (expiringCalibrations.length + pendingRequests.length + failuresList.filter((f) => f.status !== 'resolved').length).toLocaleString('fa-IR') + ' مورد'}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Role: Asset Manager & Warehouse Keeper */}
              {(currentUser?.role === 'asset_manager' || currentUser?.role === 'warehouse_keeper') ? (
                <>
                  {/* Draft items / Tagging */}
                  <div
                    onClick={() => {
                      if (onNavigateToInventoryWithAction) {
                        onNavigateToInventoryWithAction({
                          initialTab: 'drafts',
                          actionGuidance: {
                            type: 'draft_tagging',
                            title: 'تکمیل شناسنامه، تخصیص کد اموال و پلاک‌کوبی تجهیزات پیش‌نویس',
                            description: 'اقلام پیش‌نویس فوق فاقد کد دائم اموال، محل دقیق یا سریال هستند. لطفاً با زدن دکمه «تکمیل و صدور پلاک»، شناسنامه کالا را تکمیل کرده و برچسب QR فلزی صادر فرمایید.',
                            targetDraftId: 'eq-draft-2',
                          },
                        });
                      } else {
                        setActivePage('inventory');
                      }
                    }}
                    className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 hover:bg-emerald-100/70 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <div className="text-xs font-black text-emerald-950 flex items-center justify-between">
                        <span>تجهیزات فاقد کد اموال و پیش‌نویس</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-200/90 font-bold text-emerald-900">اقدام فوری</span>
                      </div>
                      <p className="text-[11px] text-emerald-900/90 mt-1 leading-relaxed">
                        {draftCount.toLocaleString('fa-IR')} قلم کالا در صف الصاق شناسه و صدور برچسب QR فلزی قرار دارد.
                      </p>
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-emerald-200/60 text-[10px]">
                        <span className="text-emerald-800 font-bold">اقدام لازم: تخصیص کد اموال و پلاک بارکد</span>
                        <span className="text-emerald-700 font-black flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                          تکمیل و پلاک‌کوبی ❮
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Shortage Warning */}
                  <div
                    onClick={() => {
                      if (onNavigateToInventoryWithAction) {
                        onNavigateToInventoryWithAction({
                          initialTab: 'inventory',
                          initialLayout: 'individual',
                          initialStatusFilter: 'low_stock',
                          actionGuidance: {
                            type: 'low_stock',
                            title: 'مدیریت و تامین اقلام با کسری موجودی',
                            description: 'موجودی اقلام مصرفی انبار به کمتر از نقطه سفارش رسیده است. جهت شارژ انبار، رسید ورود کالا ثبت نمایید یا حواله تامین صادر کنید.',
                          },
                        });
                      } else {
                        setActivePage('inventory');
                      }
                    }}
                    className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 hover:bg-amber-100/70 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <div className="text-xs font-black text-amber-950 flex items-center justify-between">
                        <span>کسری موجودی اقلام مصرفی</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200/90 font-bold text-amber-900">نقطه سفارش</span>
                      </div>
                      <p className="text-[11px] text-amber-900/90 mt-1 leading-relaxed">
                        موجودی ست پانسمان و سرم انبار مرکزی به زیر ۵ کارتن رسیده و نیازمند صدور حواله تامین است.
                      </p>
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-amber-200/60 text-[10px]">
                        <span className="text-amber-800 font-bold">اقدام لازم: ثبت رسید ورود یا ارجاع به تدارکات</span>
                        <span className="text-amber-700 font-black flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                          مشاهده اقلام کسری ❮
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Asset Transfer */}
                  <div
                    onClick={() => {
                      if (onNavigateToInventoryWithAction) {
                        onNavigateToInventoryWithAction({
                          initialTab: 'inventory',
                          openAssetTransferModal: true,
                          actionGuidance: {
                            type: 'asset_transfer',
                            title: 'صورت‌جلسه تحویل و تحول اموال بین بخش‌ها',
                            description: 'انتقال تجهیزات ثبت‌شده بخش ICU به بخش جراحی در انتظار تایید و امضای الکترونیک امین اموال است.',
                          },
                        });
                      } else {
                        setActivePage('inventory');
                      }
                    }}
                    className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 hover:bg-blue-100/70 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-200/80 text-[#2b64f6] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <div className="text-xs font-black text-blue-950 flex items-center justify-between">
                        <span>تحویل و جابجایی اموال بخش‌ها</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-200/90 font-bold text-blue-900">صورت‌جلسه</span>
                      </div>
                      <p className="text-[11px] text-blue-900/90 mt-1 leading-relaxed">
                        انتقال تجهیزات ثبت‌شده بخش ICU به بخش جراحی در صف تایید تحویل و تحول اموال است.
                      </p>
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-blue-200/60 text-[10px]">
                        <span className="text-blue-800 font-bold">اقدام لازم: بررسی و امضای صورت‌جلسه انتقال</span>
                        <span className="text-blue-700 font-black flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                          بررسی صورت‌جلسه ❮
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : currentUser?.role === 'finance_manager' ? (
                <>
                  {/* Purchase approval / Budget */}
                  <div
                    onClick={() => setActivePage('purchase_requests')}
                    className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100/90 hover:bg-emerald-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs font-black text-emerald-900 flex items-center justify-between">
                        <span>درخواست‌های خرید در انتظار تامین اعتبار</span>
                        <span className="text-[10px] font-medium text-emerald-700">تایید مالی</span>
                      </div>
                      <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                        {pendingRequests.length.toLocaleString('fa-IR')} سفارش خرید نیازمند بررسی ردیف بودجه و صدور تاییدیه مالی است.
                      </p>
                    </div>
                  </div>

                  {/* Official Invoices */}
                  <div
                    onClick={() => setActivePage('purchase_requests')}
                    className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100/90 hover:bg-blue-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-200/80 text-[#2b64f6] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs font-black text-blue-900 flex items-center justify-between">
                        <span>صورت‌حساب‌های رسمی تامین‌کنندگان</span>
                        <span className="text-[10px] font-medium text-blue-700">حسابرسی</span>
                      </div>
                      <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                        فاکتورهای دوره مردادماه و کسورات قانونی آماده نهایی‌سازی و تطبیق با اسناد مالی است.
                      </p>
                    </div>
                  </div>

                  {/* Asset Depreciation */}
                  <div
                    onClick={() => setActivePage('reports')}
                    className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100/90 hover:bg-indigo-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-200/80 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs font-black text-indigo-900 flex items-center justify-between">
                        <span>پایش استهلاک فصلی اموال</span>
                        <span className="text-[10px] font-medium text-indigo-700">دفاتر مالی</span>
                      </div>
                      <p className="text-[11px] text-indigo-800/90 mt-0.5 leading-relaxed">
                        محاسبه ارزش دفتری و استهلاک تجهیزات سرمایه‌ای بیمارستان برای گزارش فصلی.
                      </p>
                    </div>
                  </div>
                </>
              ) : currentUser?.role === 'procurement_officer' ? (
                <>
                  {/* Approved purchase requests */}
                  <div
                    onClick={() => setActivePage('purchase_requests')}
                    className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100/90 hover:bg-blue-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-200/80 text-[#2b64f6] flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs font-black text-blue-900 flex items-center justify-between">
                        <span>سفارشات تاییدشده آماده استعلام</span>
                        <span className="text-[10px] font-medium text-blue-700">تدارکات</span>
                      </div>
                      <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                        {pendingRequests.length.toLocaleString('fa-IR')} سفارش خرید در صف استعلام قیمت و صدور پیش‌فاکتور قرار دارد.
                      </p>
                    </div>
                  </div>

                  {/* Supplier inquiries */}
                  <div
                    onClick={() => setActivePage('suppliers')}
                    className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100/90 hover:bg-amber-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs font-black text-amber-900 flex items-center justify-between">
                        <span>پیگیری استعلام و تامین‌کنندگان</span>
                        <span className="text-[10px] font-medium text-amber-700">تامین‌کنندگان</span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                        پیش‌فاکتور شرکت‌های بازرگانی تجهیزات مصرفی جهت بررسی قیمت نهایی و بارگذاری در سامانه.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Technical & Clinical Roles: Calibration */}
                  {expiringCalibrations.length > 0 && (
                    <div
                      onClick={() => setActivePage('calibration')}
                      className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100/90 hover:bg-amber-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-xs font-black text-amber-900 flex items-center justify-between">
                          <span>انقضای کالیبراسیون</span>
                          <span className="text-[10px] font-medium text-amber-700">فوری</span>
                        </div>
                        <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                          {expiringCalibrations.length.toLocaleString('fa-IR')} دستگاه نیازمند تمدید گواهی کالیبراسیون هستند.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Emergency Failure */}
                  {failuresList.some((f) => f.status !== 'resolved') && (
                    <div
                      onClick={() => setActivePage('failures')}
                      className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100/90 hover:bg-rose-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-200/80 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-xs font-black text-rose-900 flex items-center justify-between">
                          <span>گزارش خرابی ثبت‌شده</span>
                          <span className="text-[10px] font-medium text-rose-700">اورژانس</span>
                        </div>
                        <p className="text-[11px] text-rose-800/90 mt-0.5 leading-relaxed">
                          {failuresList.filter((f) => f.status !== 'resolved').length.toLocaleString('fa-IR')} تجهیز در وضعیت پیگیری تعمیر یا تعویض قطعه قرار دارد.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Purchase Request */}
                  {pendingRequests.length > 0 && (
                    <div
                      onClick={() => setActivePage('purchase_requests')}
                      className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100/90 hover:bg-blue-100/70 transition-all cursor-pointer flex items-start gap-3 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-200/80 text-[#2b64f6] flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-xs font-black text-blue-900 flex items-center justify-between">
                          <span>درخواست خرید در انتظار</span>
                          <span className="text-[10px] font-medium text-blue-700">تایید</span>
                        </div>
                        <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                          {pendingRequests.length.toLocaleString('fa-IR')} سفارش خرید جدید نیازمند بررسی و تایید کارشناسی است.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Smart System Reminder / PM */}
                  <div
                    onClick={() => setActivePage('tasks')}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                        <span>چک‌لیست نگهداری (PM)</span>
                        <span className="text-[10px] font-medium text-slate-500">امروز</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {tasksList.filter((t) => t.status !== 'completed').length.toLocaleString('fa-IR')} وظیفه دوره‌ای برای شیفت جاری ثبت شده است.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setActivePage('calendar')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#2b64f6] text-xs font-bold border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>مشاهده تقویم و رخدادها</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
