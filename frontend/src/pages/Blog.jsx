import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, TrendingUp } from 'lucide-react'

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: 'كيف تبني استراتيجية عمل ناجحة في 2026',
      excerpt: 'دليل شامل لبناء استراتيجية عمل قوية تساعدك على تحقيق أهدافك وتجاوز المنافسين',
      author: 'فريق SCQ',
      date: '15 مارس 2026',
      category: 'استراتيجية',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
      readTime: '5 دقائق'
    },
    {
      id: 2,
      title: 'أهمية الموارد البشرية في نجاح الشركات',
      excerpt: 'كيف يمكن لإدارة الموارد البشرية الفعالة أن تحدث فرقاً كبيراً في أداء شركتك',
      author: 'فريق SCQ',
      date: '10 مارس 2026',
      category: 'موارد بشرية',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop',
      readTime: '4 دقائق'
    },
    {
      id: 3,
      title: 'التحول الرقمي: ضرورة أم خيار؟',
      excerpt: 'لماذا أصبح التحول الرقمي ضرورة حتمية للشركات في العصر الحديث',
      author: 'فريق SCQ',
      date: '5 مارس 2026',
      category: 'تكنولوجيا',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
      readTime: '6 دقائق'
    },
    {
      id: 4,
      title: 'مؤشرات الأداء الرئيسية (KPIs) التي يجب تتبعها',
      excerpt: 'تعرف على أهم مؤشرات الأداء التي يجب على كل شركة قياسها لضمان النجاح',
      author: 'فريق SCQ',
      date: '1 مارس 2026',
      category: 'إدارة',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      readTime: '7 دقائق'
    },
    {
      id: 5,
      title: 'كيف تدير التغيير التنظيمي بنجاح',
      excerpt: 'استراتيجيات فعالة لإدارة التغيير في شركتك دون مقاومة من الموظفين',
      author: 'فريق SCQ',
      date: '25 فبراير 2026',
      category: 'تطوير تنظيمي',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop',
      readTime: '5 دقائق'
    },
    {
      id: 6,
      title: 'الذكاء الاصطناعي في الاستشارات الإدارية',
      excerpt: 'كيف يغير الذكاء الاصطناعي مستقبل الاستشارات الإدارية والأعمال',
      author: 'فريق SCQ',
      date: '20 فبراير 2026',
      category: 'ذكاء اصطناعي',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
      readTime: '8 دقائق'
    }
  ]

  const categories = ['الكل', 'استراتيجية', 'موارد بشرية', 'تكنولوجيا', 'إدارة', 'تطوير تنظيمي']

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
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  index === 0
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {post.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar size={16} />
                      <span>{post.date}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>

                  {/* Read More */}
                  <button className="flex items-center space-x-2 space-x-reverse text-secondary font-semibold group-hover:gap-3 transition-all">
                    <span>اقرأ المزيد</span>
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-white transition-all">
              تحميل المزيد
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Blog
