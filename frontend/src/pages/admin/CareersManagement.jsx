import { Link } from 'react-router-dom'
import { 
  ArrowRight,
  Briefcase
} from 'lucide-react'

const CareersManagement = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">إدارة طلبات التوظيف</h1>
              <p className="text-slate-600 mt-1">قيد التطوير</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border-2 border-slate-100">
          <Briefcase className="w-24 h-24 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">نظام إدارة التوظيف قيد التطوير</h2>
          <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
            نعمل حالياً على تطوير نظام متكامل لإدارة طلبات التوظيف. سيتم تفعيل هذه الصفحة قريباً.
          </p>
          <div className="bg-blue-50 rounded-xl p-6 max-w-xl mx-auto">
            <p className="text-sm text-slate-700">
              💡 <strong>ملاحظة:</strong> يمكنك حالياً إدارة المرشحين من خلال صفحة "المرشحين" في القائمة الجانبية.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CareersManagement
