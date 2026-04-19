import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  MessageSquare, 
  Search, 
  Filter,
  ArrowLeft,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react'

const ContactsManagement = () => {
  const [contacts, setContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedContact, setSelectedContact] = useState(null)

  useEffect(() => {
    // Load contacts
    loadContacts()
  }, [])

  const loadContacts = () => {
    const storedContacts = JSON.parse(localStorage.getItem('scq_contacts') || '[]')
    setContacts(storedContacts.sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  const handleStatusChange = (contactId, newStatus) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, status: newStatus } : contact
    )
    setContacts(updatedContacts)
    localStorage.setItem('scq_contacts', JSON.stringify(updatedContacts))
  }

  const handleDelete = (contactId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      const updatedContacts = contacts.filter(contact => contact.id !== contactId)
      setContacts(updatedContacts)
      localStorage.setItem('scq_contacts', JSON.stringify(updatedContacts))
      setSelectedContact(null)
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700'
    }
    
    const labels = {
      new: 'جديد',
      contacted: 'تم التواصل',
      pending: 'قيد المتابعة'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">إدارة الرسائل</h1>
                <p className="text-sm text-slate-600">عرض وإدارة رسائل التواصل</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-slate-600">إجمالي الرسائل: </span>
                <span className="font-bold text-blue-600">{contacts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، البريد، أو الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="new">جديد</option>
                    <option value="contacted">تم التواصل</option>
                    <option value="pending">قيد المتابعة</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contacts Cards */}
            <div className="space-y-3">
              {filteredContacts.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">لا توجد رسائل</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedContact(contact)}
                    className={`bg-white rounded-xl p-5 cursor-pointer transition-all border-2 ${
                      selectedContact?.id === contact.id
                        ? 'border-blue-500 shadow-lg'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{contact.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(contact.date).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      {getStatusBadge(contact.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4" />
                        <span>{contact.businessType}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm text-slate-600 line-clamp-2">{contact.message}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-1">
            {selectedContact ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 sticky top-24"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">تفاصيل الرسالة</h2>
                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">الاسم</label>
                    <p className="font-medium text-slate-900">{selectedContact.name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">البريد الإلكتروني</label>
                    <p className="font-medium text-slate-900">{selectedContact.email}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">رقم الهاتف</label>
                    <p className="font-medium text-slate-900" dir="ltr">{selectedContact.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">نوع العمل</label>
                    <p className="font-medium text-slate-900">{selectedContact.businessType}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">التاريخ</label>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedContact.date).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">الرسالة</label>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-900 whitespace-pre-wrap">{selectedContact.message}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">تغيير الحالة</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStatusChange(selectedContact.id, 'new')}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedContact.status === 'new'
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <Clock className="w-4 h-4 inline mr-2" />
                        جديد
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedContact.id, 'contacted')}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedContact.status === 'contacted'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        تم التواصل
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedContact.id, 'pending')}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedContact.status === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        قيد المتابعة
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">اختر رسالة لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactsManagement
