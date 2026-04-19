import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Plus, Edit2, Trash2, Eye, EyeOff, X, Save } from 'lucide-react'
import { getBlogPosts, createBlogPost, updateBlogPost, toggleBlogPublish, deleteBlogPost } from '../../utils/adminApi'

const BlogManagement = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [toast, setToast] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', author: 'فريق SCK', category: 'استراتيجية', image_url: ''
  })
  const [saving, setSaving] = useState(false)

  const categories = ['استراتيجية', 'موارد بشرية', 'تكنولوجيا', 'إدارة', 'تسويق', 'مالية']

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 50 }
      if (searchTerm) params.search = searchTerm
      const result = await getBlogPosts(params)
      setPosts(result.data || [])
      setTotalCount(result.count || 0)
    } catch (err) {
      setError('فشل في تحميل المقالات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])
  useEffect(() => {
    const t = setTimeout(() => fetchPosts(), 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreateModal = () => {
    setEditingPost(null)
    setFormData({ title: '', excerpt: '', content: '', author: 'فريق SCK', category: 'استراتيجية', image_url: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title, excerpt: post.excerpt, content: post.content,
      author: post.author, category: post.category, image_url: post.image_url || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.excerpt || !formData.content) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingPost) {
        await updateBlogPost(editingPost.id, formData)
        showToast('تم تحديث المقال بنجاح')
      } else {
        await createBlogPost(formData)
        showToast('تم إنشاء المقال بنجاح')
      }
      setIsModalOpen(false)
      fetchPosts()
    } catch (err) {
      showToast('فشل في حفظ المقال', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (post) => {
    try {
      await toggleBlogPublish(post.id, !post.is_published)
      showToast(post.is_published ? 'تم إلغاء نشر المقال' : 'تم نشر المقال')
      fetchPosts()
    } catch (err) {
      showToast('فشل في تغيير حالة النشر', 'error')
    }
  }

  const handleDelete = async (postId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المقال؟')) return
    try {
      await deleteBlogPost(postId)
      showToast('تم حذف المقال بنجاح')
      fetchPosts()
    } catch (err) {
      showToast('فشل في حذف المقال', 'error')
    }
  }

  return (
    <div>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-lg font-semibold ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة المدونة</h2>
          <p className="text-slate-600 mt-1">إجمالي {totalCount} مقال</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5" />
          مقال جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالعنوان أو الكاتب..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" />
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
          <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button onClick={fetchPosts} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">إعادة المحاولة</button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg mb-4">لا توجد مقالات</p>
          <button onClick={openCreateModal} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">
            إنشاء أول مقال
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">{post.category}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.is_published ? 'منشور' : 'مسودة'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{post.author}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleTogglePublish(post)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title={post.is_published ? 'إلغاء النشر' : 'نشر'}>
                      {post.is_published ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                    </button>
                    <button onClick={() => openEditModal(post)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="تعديل">
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(post.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <button onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingPost ? 'تعديل المقال' : 'مقال جديد'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">العنوان *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="عنوان المقال" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">التصنيف</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الكاتب</label>
                    <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">رابط الصورة</label>
                  <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="https://..." dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">المقتطف *</label>
                  <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows="2" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="وصف مختصر للمقال" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">المحتوى *</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="8" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="اكتب محتوى المقال هنا..." required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                    <Save className="w-5 h-5" />
                    {saving ? 'جاري الحفظ...' : (editingPost ? 'تحديث المقال' : 'نشر المقال')}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors">
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BlogManagement
