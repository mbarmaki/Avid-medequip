import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Hash,
  ListFilter,
  ToggleLeft,
  FileUp,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Layers,
  HelpCircle,
  PackageCheck,
  Check,
  X,
  Sparkles,
  Info,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AssetClassification,
  AssetRequirementField,
  AssetFieldType,
} from '../../types';

interface AssetStructureViewProps {
  classificationsList: AssetClassification[];
  onAddClassification: (
    newCategory: Omit<AssetClassification, 'id' | 'createdAt' | 'updatedAt' | 'itemsCount'>
  ) => { id: string } | void;
  onUpdateClassification: (updated: AssetClassification) => void;
  onToggleActive: (id: string) => void;
  onDeleteClassification: (id: string) => boolean;
}

const FIELD_TYPE_LABELS: Record<
  AssetFieldType,
  { label: string; icon: React.ElementType; color: string }
> = {
  text: { label: 'متن', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  number: { label: 'عدد', icon: Hash, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  date: { label: 'تاریخ', icon: Calendar, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  select: { label: 'انتخاب از گزینه‌ها', icon: ListFilter, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  boolean: { label: 'بله / خیر', icon: ToggleLeft, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  file: { label: 'فایل / سند', icon: FileUp, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  image: { label: 'تصویر', icon: ImageIcon, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
};

export const AssetStructureView: React.FC<AssetStructureViewProps> = ({
  classificationsList,
  onAddClassification,
  onUpdateClassification,
  onToggleActive,
  onDeleteClassification,
}) => {
  // State for Tree - Collapsed by default
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentFilter, setSelectedParentFilter] = useState<string>('all');

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetClassification | null>(null);

  // State for Detail Drawer/Modal
  const [detailCategory, setDetailCategory] = useState<AssetClassification | null>(null);

  // Form State for Create/Edit
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formFields, setFormFields] = useState<AssetRequirementField[]>([]);

  // Determine current form classification level (1: Category, 2: Subcategory, 3: Type)
  const formLevel = useMemo(() => {
    if (!formParentId) return 1;
    const parent = classificationsList.find((c) => c.id === formParentId);
    if (!parent || !parent.parentId) return 2;
    return 3;
  }, [formParentId, classificationsList]);

  // Only Type (Level 3) can define custom fields
  const isFormTypeLevel = formLevel === 3;

  const [newOptionInput, setNewOptionInput] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Toggle tree node expansion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    classificationsList.forEach((c) => {
      allExpanded[c.id] = true;
    });
    setExpandedIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Default initial fields for Type level
  const getDefaultTypeFields = (): AssetRequirementField[] => [
    {
      id: `f-${Date.now()}-1`,
      name: 'برند سازنده',
      type: 'text',
      required: true,
      helpText: 'نام کمپانی یا شرکت تولیدکننده',
      order: 1,
    },
    {
      id: `f-${Date.now()}-2`,
      name: 'مدل دستگاه',
      type: 'text',
      required: true,
      helpText: 'مدل تجاری درج شده روی دستگاه',
      order: 2,
    },
    {
      id: `f-${Date.now()}-3`,
      name: 'شماره سریال',
      type: 'text',
      required: true,
      helpText: 'شناسه یکتا روی پلاک فنی',
      order: 3,
    },
    {
      id: `f-${Date.now()}-4`,
      name: 'کد اموال',
      type: 'text',
      required: true,
      helpText: 'شماره پلاک اموال بیمارستانی',
      order: 4,
    },
  ];

  // Open Create Modal
  const handleOpenCreateModal = (parentId?: string) => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormParentId(parentId || '');
    setFormError(null);

    // Initialize fields only if starting directly at level 3 (Type)
    const targetParent = parentId ? classificationsList.find((c) => c.id === parentId) : null;
    const isTargetType = targetParent && targetParent.parentId;
    setFormFields(isTargetType ? getDefaultTypeFields() : []);

    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (category: AssetClassification) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description);
    setFormParentId(category.parentId || '');
    
    // Check level: fields only if Level 3 (Type)
    const lvl = !category.parentId ? 1 : classificationsList.find(c => c.id === category.parentId)?.parentId ? 3 : 2;
    setFormFields(lvl === 3 ? [...category.fields] : []);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Auto-generate slug from Persian name if slug is empty or pristine
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory && !formSlug) {
      const generatedSlug = val
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      if (generatedSlug) {
        setFormSlug(generatedSlug);
      }
    }
  };

  // Add a new custom field to builder
  const handleAddField = () => {
    const newField: AssetRequirementField = {
      id: `f-${Date.now()}`,
      name: `فیلد جدید ${formFields.length + 1}`,
      type: 'text',
      required: true,
      helpText: '',
      order: formFields.length + 1,
    };
    setFormFields((prev) => [...prev, newField]);
  };

  // Update a field in builder
  const handleUpdateField = (id: string, key: keyof AssetRequirementField, value: any) => {
    setFormFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, [key]: value };
          if (key === 'type' && value === 'select' && (!updated.options || updated.options.length === 0)) {
            updated.options = ['گزینه ۱', 'گزینه ۲'];
          }
          return updated;
        }
        return f;
      })
    );
  };

  // Move field up/down
  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formFields.length) return;

    const newArr = [...formFields];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    const reordered = newArr.map((f, i) => ({ ...f, order: i + 1 }));
    setFormFields(reordered);
  };

  // Delete field
  const handleDeleteField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Add option to select field
  const handleAddOption = (fieldId: string) => {
    const val = newOptionInput[fieldId]?.trim();
    if (!val) return;

    setFormFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          const opts = f.options || [];
          if (!opts.includes(val)) {
            return { ...f, options: [...opts, val] };
          }
        }
        return f;
      })
    );
    setNewOptionInput((prev) => ({ ...prev, [fieldId]: '' }));
  };

  // Remove select option
  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    setFormFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.options) {
          const opts = f.options.filter((_, idx) => idx !== optionIndex);
          return { ...f, options: opts };
        }
        return f;
      })
    );
  };

  // Internal helper to validate and save current form state
  const saveCurrentClassification = (): string | null => {
    if (!formName.trim()) {
      setFormError('لطفاً نام را وارد کنید.');
      return null;
    }
    if (!formSlug.trim()) {
      setFormError('لطفاً اسلاگ انگلیسی را وارد کنید.');
      return null;
    }

    // Check duplicate slug
    const duplicate = classificationsList.find(
      (c) => c.slug.toLowerCase() === formSlug.trim().toLowerCase() && c.id !== editingCategory?.id
    );
    if (duplicate) {
      setFormError(`اسلاگ "${formSlug}" قبلاً برای دسته‌بندی/زیردسته دیگری ثبت شده است.`);
      return null;
    }

    const parentCat = classificationsList.find((c) => c.id === formParentId);

    // CRITICAL CORE RULE: Only Type (Level 3) can have custom fields
    const finalFields = isFormTypeLevel ? formFields : [];

    let createdId = `cls-${Date.now()}`;

    if (editingCategory) {
      const updated: AssetClassification = {
        ...editingCategory,
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
        parentId: formParentId || undefined,
        parentName: parentCat ? parentCat.name : undefined,
        fields: finalFields,
        updatedAt: '۱۴۰۳/۰۵/۲۱',
      };
      onUpdateClassification(updated);
      if (detailCategory?.id === updated.id) {
        setDetailCategory(updated);
      }
      createdId = updated.id;
    } else {
      const res = onAddClassification({
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
        parentId: formParentId || undefined,
        parentName: parentCat ? parentCat.name : undefined,
        isActive: true,
        fields: finalFields,
      });
      if (res && res.id) {
        createdId = res.id;
      }
    }

    return createdId;
  };

  // Save current step and close modal
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const savedId = saveCurrentClassification();
    if (savedId) {
      setIsModalOpen(false);
    }
  };

  // Sequential creation: Save current level & advance to next level in hierarchy
  const handleSaveAndAdvance = () => {
    const savedId = saveCurrentClassification();
    if (!savedId) return;

    // Reset form inputs for the next hierarchy level
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormError(null);
    setFormParentId(savedId);

    // If advancing to level 3 (Type), set default fields
    if (formLevel === 2) {
      setFormFields(getDefaultTypeFields());
    } else {
      setFormFields([]);
    }
  };

  // Attempt delete
  const handleDeleteAttempt = (cat: AssetClassification) => {
    if (cat.itemsCount > 0) {
      setDeleteWarning(
        `امکان حذف دسته‌بندی "${cat.name}" وجود ندارد زیرا دارای ${cat.itemsCount} قلم ثبت‌شده می‌باشد. برای عدم استفاده، می‌توانید آن را «غیرفعال» کنید.`
      );
      return;
    }
    const success = onDeleteClassification(cat.id);
    if (success && detailCategory?.id === cat.id) {
      setDetailCategory(null);
    }
  };

  // Filter root classifications
  const rootClassifications = useMemo(() => {
    let list = classificationsList;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [classificationsList, searchQuery]);

  // Build tree mapping
  const treeHierarchy = useMemo(() => {
    const parentMap: Record<string, AssetClassification[]> = {};
    const roots: AssetClassification[] = [];

    rootClassifications.forEach((item) => {
      if (!item.parentId) {
        roots.push(item);
      } else {
        if (!parentMap[item.parentId]) {
          parentMap[item.parentId] = [];
        }
        parentMap[item.parentId].push(item);
      }
    });

    return { roots, parentMap };
  }, [rootClassifications]);

  // Parent Category options for Level 2 & 3 selection
  const level1Categories = useMemo(() => {
    return classificationsList.filter((c) => !c.parentId);
  }, [classificationsList]);

  const level2Subcategories = useMemo(() => {
    return classificationsList.filter((c) => {
      if (!c.parentId) return false;
      const p = classificationsList.find((p) => p.id === c.parentId);
      return p && !p.parentId;
    });
  }, [classificationsList]);

  return (
    <div className="space-y-4 dir-rtl">
      {/* Delete Warning Banner */}
      {deleteWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{deleteWarning}</span>
          </div>
          <button
            onClick={() => setDeleteWarning(null)}
            className="p-1 hover:bg-amber-100 rounded text-amber-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Tree View Left (7 Cols) + Detail Drawer Right (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tree Container */}
        <div className={detailCategory ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Search & Tree Controls Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در دسته‌بندی‌ها، زیردسته‌ها و انواع..."
                  className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2b64f6]/20 focus:border-[#2b64f6]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={expandAll}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  باز کردن همه
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  بستن همه
                </button>
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="px-3 py-1.5 bg-[#2b64f6] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ایجاد ساختار جدید</span>
                </button>
              </div>
            </div>

            {/* Tree Items List */}
            <div className="p-4 space-y-3">
              {treeHierarchy.roots.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">موردی یافت نشد.</p>
                </div>
              ) : (
                treeHierarchy.roots.map((rootNode) => (
                  <TreeNodeItem
                    key={rootNode.id}
                    node={rootNode}
                    parentMap={treeHierarchy.parentMap}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                    selectedId={detailCategory?.id}
                    classificationsList={classificationsList}
                    onSelectDetail={(cat) => setDetailCategory(cat)}
                    onOpenEdit={handleOpenEditModal}
                    onAddChild={(parentId) => handleOpenCreateModal(parentId)}
                    onToggleActive={onToggleActive}
                    onDeleteAttempt={handleDeleteAttempt}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Classification Detail Panel */}
        {detailCategory && (
          <div className="lg:col-span-5 sticky top-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden transition-all">
              {/* Detail Header */}
              <div className="p-5 bg-gradient-to-br from-blue-500/10 via-slate-500/5 to-white border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const lvl = !detailCategory.parentId ? 1 : classificationsList.find(c => c.id === detailCategory.parentId)?.parentId ? 3 : 2;
                        return (
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {lvl === 1 ? 'دسته‌بندی' : lvl === 2 ? 'زیردسته' : 'نوع'}
                          </span>
                        );
                      })()}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{detailCategory.name}</h2>
                    {detailCategory.parentName && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span>والد:</span>
                        <span className="font-medium text-slate-700">{detailCategory.parentName}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setDetailCategory(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {detailCategory.description || 'بدون توضیحات ثبت‌شده.'}
                </p>

                {/* Quick Info Badges */}
                <div className="flex items-center gap-3 mt-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>تعداد اقلام: {detailCategory.itemsCount}</span>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-5 space-y-4">
                {/* Actions Toolbar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(detailCategory)}
                    className="flex-1 py-2 px-3 bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>ویرایش</span>
                  </button>

                  {/* Show add child ONLY if level < 3 */}
                  {(() => {
                    const lvl = !detailCategory.parentId ? 1 : classificationsList.find(c => c.id === detailCategory.parentId)?.parentId ? 3 : 2;
                    if (lvl < 3) {
                      return (
                        <button
                          onClick={() => handleOpenCreateModal(detailCategory.id)}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                          <span>{lvl === 1 ? '+ افزودن زیردسته' : '+ افزودن نوع'}</span>
                        </button>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={() => onToggleActive(detailCategory.id)}
                    className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      detailCategory.isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {detailCategory.isActive ? 'فعال' : 'غیرفعال'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT CLASSIFICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl my-8 overflow-hidden dir-rtl">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {editingCategory
                      ? `ویرایش ساختار «${editingCategory.name}»`
                      : formLevel === 1
                      ? 'ایجاد دسته‌بندی جدید'
                      : formLevel === 2
                      ? 'ایجاد زیردسته جدید'
                      : 'ایجاد نوع جدید و تعریف فیلدها'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Creation Wizard Sequential Stepper (For New Creations) */}
            {!editingCategory && (
              <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="text-slate-500">روند ایجاد:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg ${formLevel === 1 ? 'bg-[#2b64f6] text-white font-extrabold shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                      دسته‌بندی
                    </span>
                    <ArrowLeftIcon />
                    <span className={`px-2.5 py-1 rounded-lg ${formLevel === 2 ? 'bg-[#2b64f6] text-white font-extrabold shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                      زیردسته
                    </span>
                    <ArrowLeftIcon />
                    <span className={`px-2.5 py-1 rounded-lg ${formLevel === 3 ? 'bg-[#2b64f6] text-white font-extrabold shadow-sm' : 'bg-slate-200 text-slate-600'}`}>
                      نوع
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
                <button onClick={() => setFormError(null)}>
                  <X className="w-4 h-4 text-red-400 hover:text-red-600" />
                </button>
              </div>
            )}

            {/* Form Body - Split into 2 Columns */}
            <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Form Controls */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Basic Info Section */}
                  <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>
                        اطلاعات {formLevel === 1 ? 'دسته‌بندی' : formLevel === 2 ? 'زیردسته' : 'نوع'}
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          عنوان <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder={formLevel === 1 ? 'مثال: تجهیزات پزشکی' : formLevel === 2 ? 'مثال: تجهیزات تنفسی' : 'مثال: ونتیلاتور'}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          اسلاگ (شناسه انگلیسی) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          placeholder="مثال: ventilator"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Parent Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        والد متبوع در ساختار
                      </label>
                      <select
                        value={formParentId}
                        onChange={(e) => setFormParentId(e.target.value)}
                        disabled={!!editingCategory}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100"
                      >
                        <option value="">دسته‌بندی اصلی</option>
                        {classificationsList
                          .filter((c) => c.id !== editingCategory?.id)
                          .map((c) => {
                            const parentLvl = !c.parentId ? 1 : 2;
                            return (
                              <option key={c.id} value={c.id}>
                                {parentLvl === 1 ? 'دسته‌بندی:' : 'زیردسته:'} {c.name} ({c.slug})
                              </option>
                            );
                          })}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        توضیحات
                      </label>
                      <textarea
                        rows={2}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="توضیح کوتاه درباره این بخش..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Category Repurchase Approval Chain (For Level 1 & 2 Categories) */}
                    {formLevel <= 2 && (
                      <div className="pt-2 border-t border-slate-200">
                        <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>زنجیره تاییدهای خرید مجدد (Approval Chain):</span>
                        </label>
                        <p className="text-[10px] text-slate-500 mb-2">
                          تعیین نقش‌هایی که باید درخواست خرید مجدد تجهیزات این دسته‌بندی را تایید کنند:
                        </p>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-700">
                            <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">۱</span>
                            <span>مسئول خرید و تدارکات</span>
                            <span className="text-[10px] text-slate-400 mr-auto">(بررسی اولیه فاکتور)</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-700">
                            <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">۲</span>
                            <span>مسئول مالی و بودجه</span>
                            <span className="text-[10px] text-slate-400 mr-auto">(تخصیص اعتبارات)</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-700">
                            <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">۳</span>
                            <span>رئیس دپارتمان / مدیر ارشد</span>
                            <span className="text-[10px] text-slate-400 mr-auto">(تایید نهایی)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Requirements Dynamic Builder Section - ONLY FOR TYPE LEVEL (LEVEL 3) */}
                  {isFormTypeLevel ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                            <span>فیلدهای نوع</span>
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddField}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>افزودن فیلد</span>
                        </button>
                      </div>

                      {/* Fields List Builder */}
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {formFields.length === 0 ? (
                          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                            <p className="text-xs text-slate-500">هیچ فیلدی برای این نوع تعریف نشده است.</p>
                            <button
                              type="button"
                              onClick={handleAddField}
                              className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              + افزودن اولین فیلد
                            </button>
                          </div>
                        ) : (
                          formFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm space-y-3 transition-all hover:border-blue-300"
                            >
                              {/* Field Row Controls */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="w-5 h-5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full flex items-center justify-center shrink-0">
                                    {index + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={field.name}
                                    onChange={(e) =>
                                      handleUpdateField(field.id, 'name', e.target.value)
                                    }
                                    placeholder="نام فیلد (مثال: برند سازنده)"
                                    className="font-bold text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Order up / down */}
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => handleMoveField(index, 'up')}
                                    className="p-1 hover:bg-slate-100 disabled:opacity-30 text-slate-500 rounded cursor-pointer"
                                    title="انتقال به بالا"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === formFields.length - 1}
                                    onClick={() => handleMoveField(index, 'down')}
                                    className="p-1 hover:bg-slate-100 disabled:opacity-30 text-slate-500 rounded cursor-pointer"
                                    title="انتقال به پایین"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteField(field.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="حذف فیلد"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Field Config Row */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {/* Type Select */}
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                                    نوع فیلد
                                  </label>
                                  <select
                                    value={field.type}
                                    onChange={(e) =>
                                      handleUpdateField(
                                        field.id,
                                        'type',
                                        e.target.value as AssetFieldType
                                      )
                                    }
                                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
                                  >
                                    <option value="text">متن</option>
                                    <option value="number">عدد</option>
                                    <option value="date">تاریخ</option>
                                    <option value="select">انتخاب از گزینه‌ها</option>
                                    <option value="boolean">بله / خیر</option>
                                    <option value="file">فایل / سند</option>
                                    <option value="image">تصویر</option>
                                  </select>
                                </div>

                                {/* Required toggle */}
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                                    الزامی / اختیاری
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateField(field.id, 'required', !field.required)
                                    }
                                    className={`w-full px-2.5 py-1 text-xs font-semibold rounded border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                      field.required
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {field.required ? 'الزامی' : 'اختیاری'}
                                  </button>
                                </div>
                              </div>

                              {/* Help Text Label */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  توضیحی برای فیلد وارد کنید
                                </label>
                                <input
                                  type="text"
                                  value={field.helpText || ''}
                                  onChange={(e) =>
                                    handleUpdateField(field.id, 'helpText', e.target.value)
                                  }
                                  placeholder="توضیح راهنمای ورودی برای کاربر هنگام ثبت..."
                                  className="w-full text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>

                              {/* Select options manager if type === 'select' */}
                              {field.type === 'select' && (
                                <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2">
                                  <label className="block text-[11px] font-bold text-blue-800">
                                    گزینه‌های قابل انتخاب:
                                  </label>

                                  <div className="flex flex-wrap gap-1.5">
                                    {(field.options || []).map((opt, optIdx) => (
                                      <span
                                        key={optIdx}
                                        className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-900 px-2 py-0.5 rounded text-[11px]"
                                      >
                                        <span>{opt}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOption(field.id, optIdx)}
                                          className="text-blue-400 hover:text-red-500 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>

                                  <div className="flex items-center gap-2 pt-1">
                                    <input
                                      type="text"
                                      value={newOptionInput[field.id] || ''}
                                      onChange={(e) =>
                                        setNewOptionInput({
                                          ...newOptionInput,
                                          [field.id]: e.target.value,
                                        })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddOption(field.id);
                                        }
                                      }}
                                      placeholder="افزودن گزینه جدید (اینتر بزنید)..."
                                      className="flex-1 bg-white border border-blue-200 rounded px-2 py-1 text-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddOption(field.id)}
                                      className="px-2.5 py-1 bg-[#2b64f6] text-white rounded text-xs font-medium hover:bg-blue-700 cursor-pointer"
                                    >
                                      افزودن
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Right Side: LIVE PREVIEW OF TYPE REGISTRATION FORM */}
                <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold text-slate-800">پیش‌نمایش فرم ثبت قلم</h3>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                      زنده
                    </span>
                  </div>

                  {isFormTypeLevel ? (
                    <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3.5 shadow-sm max-h-[480px] overflow-y-auto">
                      <div className="text-[11px] text-slate-500 pb-2 border-b border-slate-100">
                        پیش‌نمایش فرم ثبت کالا برای نوع <strong className="text-slate-800">{formName || '...'}</strong>:
                      </div>

                      {formFields.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">
                          با افزودن فیلد، پیش‌نمایش فرم در این بخش نمایش داده می‌شود.
                        </p>
                      ) : (
                        formFields.map((field) => (
                          <div key={field.id} className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">
                              {field.name || 'بدون نام'}
                              {field.required && <span className="text-red-500 font-bold mr-1">*</span>}
                            </label>
                            {renderPreviewFieldInput(field)}
                            {field.helpText && (
                              <p className="text-[10px] text-slate-400">{field.helpText}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 border border-slate-200 text-center space-y-3">
                      <ShieldCheck className="w-8 h-8 text-blue-600 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-800">
                        {formLevel === 1 ? 'دسته‌بندی' : 'زیردسته'}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        پس از ذخیره، می‌توانید به ایجاد زیردسته یا نوع بپردازید.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>

                <div className="flex items-center gap-2">
                  {!editingCategory && formLevel < 3 && (
                    <button
                      type="button"
                      onClick={handleSaveAndAdvance}
                      className="px-5 py-2 bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>
                        {formLevel === 1
                          ? 'ذخیره دسته‌بندی و ایجاد زیردسته'
                          : 'ذخیره زیردسته و ایجاد نوع'}
                      </span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#2b64f6] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {editingCategory
                        ? 'ذخیره تغییرات'
                        : formLevel === 1
                        ? 'ذخیره دسته‌بندی'
                        : formLevel === 2
                        ? 'ذخیره زیردسته'
                        : 'ذخیره نوع'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon
function ArrowLeftIcon() {
  return (
    <span className="text-slate-400 font-bold">←</span>
  );
}

// Render Tree Item Component recursively
interface TreeNodeItemProps {
  node: AssetClassification;
  parentMap: Record<string, AssetClassification[]>;
  expandedIds: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  selectedId?: string;
  classificationsList: AssetClassification[];
  onSelectDetail: (cat: AssetClassification) => void;
  onOpenEdit: (cat: AssetClassification) => void;
  onAddChild: (parentId: string) => void;
  onToggleActive: (id: string) => void;
  onDeleteAttempt: (cat: AssetClassification) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  parentMap,
  expandedIds,
  toggleExpand,
  selectedId,
  classificationsList,
  onSelectDetail,
  onOpenEdit,
  onAddChild,
  onToggleActive,
  onDeleteAttempt,
}) => {
  const children = parentMap[node.id] || [];
  const isExpanded = !!expandedIds[node.id];
  const isSelected = selectedId === node.id;

  // Calculate node level (1, 2, or 3)
  const nodeLevel = useMemo(() => {
    if (!node.parentId) return 1;
    const parent = classificationsList.find((c) => c.id === node.parentId);
    if (!parent) return 1;
    if (!parent.parentId) return 2;
    return 3;
  }, [node, classificationsList]);

  return (
    <div className="space-y-1">
      {/* Node Card */}
      <div
        className={`group p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
          isSelected
            ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Expand Toggle */}
          {children.length > 0 ? (
            <button
              onClick={() => toggleExpand(node.id)}
              className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? '-rotate-90' : ''
                }`}
              />
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          )}

          {/* Level Folder Badge */}
          <div
            className={`p-2 rounded-lg shrink-0 ${
              nodeLevel === 1
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : nodeLevel === 2
                ? 'bg-sky-50 text-sky-600 border border-sky-100'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}
          >
            <FolderTree className="w-4 h-4" />
          </div>

          {/* Name & Details */}
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onSelectDetail(node)}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-800 hover:text-blue-700 transition-colors">
                {node.name}
              </span>

              {/* Level Tag */}
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  nodeLevel === 1
                    ? 'bg-blue-100 text-blue-800'
                    : nodeLevel === 2
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {nodeLevel === 1 ? 'دسته‌بندی' : nodeLevel === 2 ? 'زیردسته' : 'نوع'}
              </span>

              {!node.isActive && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                  غیرفعال
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 truncate mt-0.5">
              {node.description || 'بدون توضیحات ثبت‌شده'}
            </p>
          </div>
        </div>

        {/* Info Badges & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              اقلام: <strong className="text-slate-800">{node.itemsCount}</strong>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectDetail(node)}
              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="مشاهده جزئیات"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* NO option to add child if nodeLevel >= 3 */}
            {nodeLevel < 3 && (
              <button
                onClick={() => onAddChild(node.id)}
                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title={nodeLevel === 1 ? '+ افزودن زیردسته' : '+ افزودن نوع'}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onOpenEdit(node)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="ویرایش"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDeleteAttempt(node)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Children Tree Nodes */}
      {children.length > 0 && isExpanded && (
        <div className="pr-6 space-y-1 border-r-2 border-blue-100 mr-3">
          {children.map((childNode) => (
            <TreeNodeItem
              key={childNode.id}
              node={childNode}
              parentMap={parentMap}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedId={selectedId}
              classificationsList={classificationsList}
              onSelectDetail={onSelectDetail}
              onOpenEdit={onOpenEdit}
              onAddChild={onAddChild}
              onToggleActive={onToggleActive}
              onDeleteAttempt={onDeleteAttempt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Helper renderer for Live Preview Form Fields
function renderPreviewFieldInput(field: AssetRequirementField) {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          disabled
          placeholder={`ورود ${field.name}...`}
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
        />
      );
    case 'number':
      return (
        <input
          type="number"
          disabled
          placeholder="0"
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          disabled
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
        />
      );
    case 'select':
      return (
        <select
          disabled
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
        >
          <option value="">انتخاب کنید...</option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'boolean':
      return (
        <div className="flex items-center gap-3 py-1">
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input type="radio" disabled name={`bool-${field.id}`} defaultChecked />
            <span>بله</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input type="radio" disabled name={`bool-${field.id}`} />
            <span>خیر</span>
          </label>
        </div>
      );
    case 'file':
      return (
        <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-lg p-2.5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <FileUp className="w-4 h-4 text-slate-400" />
          <span>انتخاب یا رهاسازی فایل (PDF, DOCX)</span>
        </div>
      );
    case 'image':
      return (
        <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-lg p-2.5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span>بارگذاری تصویر (JPG, PNG)</span>
        </div>
      );
    default:
      return (
        <input
          type="text"
          disabled
          placeholder="..."
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
        />
      );
  }
}
