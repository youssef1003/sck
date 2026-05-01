import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowRight, CalendarCheck, Share2 } from 'lucide-react'

const BlogPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState([])

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blog?limit=100`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const foundPost = result.data.find(p => p.id === id)
        
        if (foundPost) {
          setPost(foundPost)
          
          // Get related posts from same category
          const related = result.data
            .filter(p => p.id !== id && p.category === foundPost.category)
            .slice(0, 3)
          setRelatedPosts(related)
        } else {
          navigate('/blog')
        }
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      navigate('/blog')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('تم نسخ الرابط!')
    }
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowRight size={20} />
            <span>العودة للمدونة</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-2 bg-secondary rounded-full text-sm font-semibold mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-gray-200 mb-6">{post.excerpt}</p>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-secondary transition-colors"
              >
                <Share2 size={18} />
                <span>مشاركة</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image_url && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </motion.div>
        </section>
      )}

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 md:p-12 shadow-sm"
        >
          <div 
            className="prose prose-lg max-w-none"
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#374151'
            }}
          >
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* CTA Section */}
          {post.booking_link && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  هل أنت مستعد للبدء؟
                </h3>
                <p className="text-gray-600 mb-6">
                  تواصل معنا الآن للحصول على استشارة مجانية
                </p>
                <Link
                  to={post.booking_link}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
                >
                  <CalendarCheck size={24} />
                  <span>احجز استشارة</span>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-primary mb-8">مقالات ذات صلة</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                {relatedPost.image_url && (
                  <img 
                    src={relatedPost.image_url} 
                    alt={relatedPost.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold mb-3">
                    {relatedPost.category}
                  </span>
                  <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogPost
