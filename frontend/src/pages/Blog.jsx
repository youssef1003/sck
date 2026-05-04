import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, TrendingUp, CalendarCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('الكل')

  const categories = ['الكل', 'استراتيجية', 'موارد بشرية', 'تكنولوجيا', 'إدارة', 'تسويق', 'مالية']

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/blog?limit=100')
      const result = await response.json()
      
      if (result.success && result.data) {
        setPosts(result.data)
      } else {
        console.error('Failed to fetch posts:', result.error)
        setPosts([])
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = selectedCategory === 'الكل' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center space-x-2 space-x-reverse bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-6">
              <TrendingUp className="text-secondary" size={20} />
              <span className="text-sm font-medium">آخر المقالات والنصائح</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">المدونة</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              نصائح وإرشادات من خبراء SCQ لمساعدتك على تطوير أعمالك
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">جاري تحميل المقالات...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">لا توجد مقالات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Image */}
                  {post.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar size={16} />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <User size={16} />
                        <span>{post.author}</span>
                      </div>
                    </div>

                    {/* Booking Button */}
                    {post.booking_link && (
                      <Link
                        to={post.booking_link}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-3"
                      >
                        <CalendarCheck size={18} />
                        <span>{post.button_text || 'احجز استشارة'}</span>
                      </Link>
                    )}

                    {/* Read More */}
                    <Link
                      to={`/blog/${post.id}`}
                      className="flex items-center space-x-2 space-x-reverse text-secondary font-semibold group-hover:gap-3 transition-all w-full justify-center"
                    >
                      <span>اقرأ المزيد</span>
                      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Blog
