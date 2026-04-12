import Hero from '../components/home/Hero'
import Services from '../components/home/Services'
import WhyChooseUs from '../components/home/WhyChooseUs'
import Stats from '../components/home/Stats'
import CTA from '../components/home/CTA'

const Home = () => {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Stats />
      <Services />
      <WhyChooseUs />
      <CTA />
    </div>
  )
}

export default Home
