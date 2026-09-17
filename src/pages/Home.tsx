import { Hero } from '../sections/Hero'
import { FlavourSelect } from '../sections/FlavourSelect'
import { Manifesto } from '../sections/Manifesto'
import { Story } from '../sections/Story'
import { Process } from '../sections/Process'
import { Gifting } from '../sections/Gifting'
import { Crunchy } from '../sections/Crunchy'
import { FlavourWorks } from '../sections/FlavourWorks'
import { WhereToBuy } from '../sections/WhereToBuy'
import { Reviews } from '../sections/Reviews'
import { FAQ } from '../sections/FAQ'
import { Contact } from '../sections/Contact'
import { Newsletter } from '../sections/Newsletter'

export function Home() {
  return (
    <>
      <Hero />
      <FlavourSelect />
      <Manifesto />
      <Story />
      <Process />
      <Gifting />
      <Crunchy />
      <FlavourWorks />
      <WhereToBuy />
      <Reviews />
      <FAQ />
      <Contact />
      <Newsletter />
    </>
  )
}
