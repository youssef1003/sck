import { Users } from 'lucide-react'

const EmployersManagement = () => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة أصحاب العمل</h2>
          <p className="text-slate-600 mt-1">قيد التطوير</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
        <Users className="w-24 h-24 text-slate-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">نظام إدارة أصحاب العمل قيد التطوير</h2>
        <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
          نعمل حالياً على تطوير نظام متكامل لإدارة حسابات أصحاب العمل والموافقة على الاشتراكات. سيتم تفعيل هذه الصفحة قريباً.
        </p>
        <div className="bg-blue-50 rounded-xl p-6 max-w-xl mx-auto">
          <p className="text-sm text-slate-700">
            💡 <strong>ملاحظة:</strong> نظام أصحاب العمل يتطلب backend API متكامل لإدارة الحسابات والصلاحيات.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmployersManagement
