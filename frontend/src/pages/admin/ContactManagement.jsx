import { MapPin } from 'lucide-react'

const ContactManagement = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة صفحة "تواصل معنا"</h1>
          <p className="text-slate-600 mt-2">قيد التطوير</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
        <MapPin className="w-24 h-24 text-slate-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">إدارة معلومات الاتصال قيد التطوير</h2>
        <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
          نعمل حالياً على تطوير نظام متكامل لإدارة معلومات الاتصال والمكاتب. سيتم تفعيل هذه الصفحة قريباً.
        </p>
        <div className="bg-blue-50 rounded-xl p-6 max-w-xl mx-auto">
          <p className="text-sm text-slate-700">
            💡 <strong>ملاحظة:</strong> لإدارة رسائل التواصل، استخدم صفحة "الرسائل" من القائمة الجانبية.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ContactManagement
