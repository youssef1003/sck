import Hero from '../components/home/Hero'
import Services from '../components/home/Services'
import WhyChooseUs from '../components/home/WhyChooseUs'
import Stats from '../components/home/Stats'
import Legacy from '../components/home/Legacy'
import CTA from '../components/home/CTA'

const Home = () => {
  return (
    <div className="home-page synqor-component overflow-hidden">
      <Hero />
      <Stats />
      <Legacy />
      <Services />
      <WhyChooseUs />
      <CTA />
    </div>
  )
}

export default Home
