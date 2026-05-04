import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Filter, Eye, Edit2, Trash2, Download, Award,
  Loader, AlertCircle, X, Save, User, Briefcase, GraduationCap
} from 'lucide-react'
import { getCandidates, updateCandidate, deleteCandidate } from '../../utils/adminApi'

const CandidatesManagement = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [canViewContactInfo, setCanViewContactInfo] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    verification_status: '',
    premium_badge: '',
    city: ''
  })

  const [editData, setEditData] = useState({
    verification_status: 'pending',
    premium_badge: false,
    status: 'new',
    admin_notes: ''
  })

  const verificationStatusOptions = ['pending', 'scq_verified', 'rejected']
  const verificationStatusLabels = {
    pending: 'قيد المراجعة',
    scq_verified: 'محقق من SCQ',
    rejected: 'مرفوض'
  }

  const statusOptions = ['new', 'reviewing', 'verified', 'hidden', 'rejected']
  const statusLabels = {
    new: 'جديد',
    reviewing: 'قيد المراجعة',
    verified: 'محقق',
    hidden: 'مخفي',
    rejected: 'مرفوض'
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await getCandidates()
      setCandidates(response.data || [])
      setCanViewContactInfo(response.canViewContactInfo || false)
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setError('فشل في تحميل المرشحين')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate)
    setEditData({
      verification_status: candidate.verification_status || 'pending',
      premium_badge: candidate.premium_badge || false,
      status: candidate.status || 'new',
      admin_notes: candidate.admin_notes || ''
    })
    setShowDetails(true)
  }

  const handleUpdate = async () => {
    if (!selectedCandidate) return

    try {
      setLoading(true)
      await updateCandidate(selectedCandidate.id, editData)
      await fetchCandidates()
      setShowDetails(false)
      setSelectedCandidate(null)
    } catch (error) {
      console.error('Error updating candidate:', error)
      setError('فشل في تحديث المرشح')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (candidate) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المرشح؟')) return

    try {
      await deleteCandidate(candidate.id)
      await fetchCandidates()
    } catch (error) {
      console.error('Error deleting candidate:', error)
      setError('فشل في حذف المرشح')
    }
  }

  const handleExportCSV = () => {
    const csvData = filteredCandidates.map(cand => ({
      'الكود': cand.candidate_code || '',
      'الاسم': cand.full_name || 'محجوب',
      'الجوال': cand.mobile || 'محجوب',
      'البريد': cand.email || 'محجوب',
      'المدينة': cand.city || '',
      'القطاع': cand.functional_sector || '',
      'المسمى': cand.current_job_title || '',
      'سنوات الخبرة': cand.total_experience_years || '',
      'الحالة': verificationStatusLabels[cand.verification_status] || cand.verification_status,
      'مميز': cand.premium_badge ? 'نعم' : 'لا'
    }))

    const headers = Object.keys(csvData[0] || {})
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredCandidates = candidates.filter(cand => {
    if (filters.verification_status && cand.verification_status !== filters.verification_status) return false
    if (filters.premium_badge !== '' && cand.premium_badge !== (filters.premium_badge === 'true')) return false
    if (filters.city && cand.city !== filters.city) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        cand.candidate_code?.toLowerCase().includes(search) ||
        cand.full_name?.toLowerCase().includes(search) ||
        cand.functional_sector?.toLowerCase().includes(search) ||
        cand.current_job_title?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const uniqueCities = [...new Set(candidates.map(c => c.city).filter(Boolean))]

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة المرشحين</h1>
          {!canViewContactInfo && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ ليس لديك صلاحية عرض معلومات الاتصال (محجوبة)
            </p>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-5 h-5" />
          <span>تصدير CSV</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Search className="w-4 h-4 inline-block ml-1" />
              بحث
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="الكود، الاسم، القطاع..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Filter className="w-4 h-4 inline-block ml-1" />
              حالة التحقق
            </label>
            <select
              value={filters.verification_status}
              onChange={(e) => setFilters(prev => ({ ...prev, verification_status: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {verificationStatusOptions.map(status => (
                <option key={status} value={status}>{verificationStatusLabels[status]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">المدينة</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">مميز</label>
            <select
              value={filters.premium_badge}
              onChange={(e) => setFilters(prev => ({ ...prev, premium_badge: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              <option value="true">نعم</option>
              <option value="false">لا</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          عرض {filteredCandidates.length} من {candidates.length} مرشح
        </div>
      </div>

      {/* Candidates Table */}
      {!showDetails && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الكود</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الاسم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">المدينة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">القطاع</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الخبرة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {candidate.candidate_code}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium text-slate-900">{candidate.full_name}</div>
                        <div className="text-sm text-slate-500">{candidate.current_job_title}</div>
                      </div>
                      {candidate.premium_badge && (
                        <Award className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {candidate.city}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {candidate.functional_sector}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {candidate.total_experience_years} سنة
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      candidate.verification_status === 'scq_verified' ? 'bg-green-100 text-green-800' :
                      candidate.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {verificationStatusLabels[candidate.verification_status] || candidate.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(candidate)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(candidate)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">تفاصيل المرشح</h2>
            <button
              onClick={() => setShowDetails(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                معلومات الاتصال
                {!canViewContactInfo && (
                  <span className="text-xs text-amber-600">(محجوبة)</span>
                )}
              </div>
              <div>
                <div className="text-sm text-slate-500">الكود</div>
                <div className="font-mono text-slate-900">{selectedCandidate.candidate_code}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">الاسم الكامل</div>
                <div className="font-medium text-slate-900">{selectedCandidate.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">رقم الهوية</div>
                <div className="font-medium text-slate-900">{selectedCandidate.national_id || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">الجوال</div>
                <div className="font-medium text-slate-900">{selectedCandidate.mobile}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">البريد الإلكتروني</div>
                <div className="font-medium text-slate-900">{selectedCandidate.email}</div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                المعلومات الأساسية
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">الجنسية</div>
                  <div className="text-slate-900">{selectedCandidate.nationality || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">الجنس</div>
                  <div className="text-slate-900">{selectedCandidate.gender || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">العمر</div>
                  <div className="text-slate-900">{selectedCandidate.age || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">الحالة الاجتماعية</div>
                  <div className="text-slate-900">{selectedCandidate.marital_status || '-'}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">الموقع</div>
                <div className="text-slate-900">
                  {[selectedCandidate.city, selectedCandidate.district, selectedCandidate.country]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="border-t border-slate-200 pt-6 mb-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              التعليم
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">المستوى التعليمي</div>
                <div className="text-slate-900">{selectedCandidate.education_level || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">التخصص</div>
                <div className="text-slate-900">{selectedCandidate.education_specialization || '-'}</div>
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="border-t border-slate-200 pt-6 mb-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" />
              الخبرة المهنية
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">القطاع الوظيفي</div>
                <div className="text-slate-900">{selectedCandidate.functional_sector || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">المسمى الوظيفي الحالي</div>
                <div className="text-slate-900">{selectedCandidate.current_job_title || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">سنوات الخبرة</div>
                <div className="text-slate-900">{selectedCandidate.total_experience_years || 0} سنة</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">الراتب المتوقع</div>
                <div className="text-slate-900">{selectedCandidate.expected_salary || '-'}</div>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">تحديث الحالة</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  حالة التحقق
                </label>
                <select
                  value={editData.verification_status}
                  onChange={(e) => setEditData(prev => ({ ...prev, verification_status: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {verificationStatusOptions.map(status => (
                    <option key={status} value={status}>{verificationStatusLabels[status]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الحالة
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.premium_badge}
                  onChange={(e) => setEditData(prev => ({ ...prev, premium_badge: e.target.checked }))}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                />
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-slate-700">مرشح مميز (Premium Badge)</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ملاحظات إدارية
              </label>
              <textarea
                value={editData.admin_notes}
                onChange={(e) => setEditData(prev => ({ ...prev, admin_notes: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="أضف ملاحظات داخلية..."
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>حفظ التحديثات</span>
            </button>
            <button
              onClick={() => setShowDetails(false)}
              className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition"
            >
              <X className="w-5 h-5" />
              <span>إلغاء</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default CandidatesManagement
