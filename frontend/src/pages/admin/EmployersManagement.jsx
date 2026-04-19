import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Search, Eye } from 'lucide-react'

const EmployersManagement = () => {
  const [employers, setEmployers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployer, setSelectedEmployer] = useState(null)

  useEffect(() => {
    loadEmployers()
  }, [])

  const loadEmployers = () => {
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const employerUsers = users.filter(u => u.userType === 'employer')
    setEmployers(employerUsers)
  }

  const handleApprove = (employerId) => {
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const updatedUsers = users.map(user => {
      if (user.id === employerId) {
        return { ...user, isApproved: true, subscriptionStatus: 'active' }
      }
      return user
    })
    localStorage.setItem('scq_users', JSON.stringify(updatedUsers))
    
    // Update current user data if they're logged in
    const currentUser = JSON.parse(localStorage.getItem('scq_user_data') || '{}')
    if (currentUser.id === employerId) {
      localStorage.setItem('scq_user_data', JSON.stringify({ ...currentUser, isApproved: true, subscriptionStatus: 'active' }))
    }
    
    loadEmployers()
  }

  const handleReject = (employerId) => {
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const updatedUsers = users.map(user => {
      if (user.id === employerId) {
        return { ...user, isApproved: false, subscriptionStatus: 'rejected' }
      }
      return user
    })
    localStorage.setItem('scq_users', JSON.stringify(updatedUsers))
    loadEmployers()
  }

  const filteredEmployers = employers.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  )

  const pendingCount = employers.filter(e => !e.isApproved && e.subscriptionStatus === 'pending').length
  const approvedCount = employers.filter(e => e.isApproved).length
  const rejectedCount = employers.filter(e => e.subscriptionStatus === 'rejected').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">إدارة أصحاب العمل</h1>
                <p className="text-blue-200 text-sm">الموافقة على طلبات الاشتراك</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">إجمالي أصحاب العمل</p>
                <p className="text-3xl font-bold text-slate-900">{employers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">قيد المراجعة</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">مقبول</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">مرفوض</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم، البريد، أو الهاتف..."
              className="w-full pr-12 pl-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-right"
            />
          </div>
        </div>

        {/* Employers List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-right">
            قائمة أصحاب العمل
          </h2>

          {filteredEmployers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">لا يوجد أصحاب عمل</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployers.map((employer) => (
                <motion.div
                  key={employer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-right flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{employer.fullName}</h3>
                      <p className="text-sm text-slate-600 mb-2">{employer.email}</p>
                      <p className="text-sm text-slate-500">{employer.phone}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${
                      employer.isApproved 
                        ? 'bg-green-50 border-green-200 text-green-600'
                        : employer.subscriptionStatus === 'rejected'
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                    }`}>
                      {employer.isApproved ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">مقبول</span>
                        </>
                      ) : employer.subscriptionStatus === 'rejected' ? (
                        <>
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">مرفوض</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5" />
                          <span className="text-sm font-medium">قيد المراجعة</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4 text-right">
                    <div>
                      <p className="text-slate-500">تاريخ التسجيل</p>
                      <p className="font-medium text-slate-900">
                        {new Date(employer.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">حالة الاشتراك</p>
                      <p className="font-medium text-slate-900">
                        {employer.subscriptionStatus === 'active' ? 'نشط' : 
                         employer.subscriptionStatus === 'rejected' ? 'مرفوض' : 'معلق'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedEmployer(employer)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      عرض التفاصيل
                    </button>
                    
                    {!employer.isApproved && employer.subscriptionStatus !== 'rejected' && (
                      <>
                        <button
                          onClick={() => handleApprove(employer.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          موافقة
                        </button>
                        <button
                          onClick={() => handleReject(employer.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </button>
                      </>
                    )}

                    {employer.subscriptionStatus === 'rejected' && (
                      <button
                        onClick={() => handleApprove(employer.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        إعادة تفعيل
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employer Details Modal */}
      {selectedEmployer && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          onClick={() => setSelectedEmployer(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEmployer(null)}
              className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"
            >
              <XCircle size={24} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-right">
              تفاصيل صاحب العمل
            </h2>

            <div className="space-y-4 text-right">
              <div>
                <p className="text-sm text-slate-500">الاسم الكامل</p>
                <p className="font-medium text-slate-900 text-lg">{selectedEmployer.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">البريد الإلكتروني</p>
                <p className="font-medium text-slate-900">{selectedEmployer.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">رقم الهاتف</p>
                <p className="font-medium text-slate-900">{selectedEmployer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">تاريخ التسجيل</p>
                <p className="font-medium text-slate-900">
                  {new Date(selectedEmployer.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">حالة الحساب</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 mt-2 ${
                  selectedEmployer.isApproved 
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : selectedEmployer.subscriptionStatus === 'rejected'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                }`}>
                  {selectedEmployer.isApproved ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">مقبول - يمكنه رؤية المرشحين</span>
                    </>
                  ) : selectedEmployer.subscriptionStatus === 'rejected' ? (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">مرفوض</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">قيد المراجعة</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployersManagement
