import Header from '../components/Header'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Brands from '../components/Brands'
import Distribuye from '../components/Distribuye'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <Nav />
      <main>
        <Hero />
        <Categories />
        <Brands />
        <Distribuye />
      </main>
      <Footer />
    </>
  )
}
