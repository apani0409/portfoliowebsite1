import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, TriangleRightFill } from 'akar-icons'
import { StaticImage } from 'gatsby-plugin-image'

import '../styles/index.scss'

// components
import ThemeDropdown from './ThemeDropdown'
import Footer from './Footer'
import ProjectCards from './ProjectCards'
import ExperienceMenu from './ExperienceMenu'
import Divider from './Divider'

// hook
import { useTheme } from '../context/ThemeContext'

// data
import projectsData from '../data/projects.json'
import experiencesData from '../data/experiences.json'
const resume = '/download/Alessandro_Pani_Resume.pdf'

function ProfileTitleHeader({ theme }: { theme: any }) {
  const container = useRef(null)
  const q = gsap.utils.selector(container)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.from(q('span'), {
      duration: 1,
      y: 100,
      ease: 'power4.out',
      delay: 0.5,
      skewY: 7,
      stagger: { amount: 0.3 },
      autoAlpha: 0,
    })
  }, [])

  return (
    <div ref={container} style={{ color: theme.text_color }} className='text-lg md:text-4xl font-medium'>
      <div className='line relative h-16 overflow-hidden'>
        <span className='absolute invisible'>Hello,</span>
      </div>
      <div className='line relative h-16 overflow-hidden'>
        <span style={{ color: theme.main_color }} className='absolute invisible'>
          <span style={{ color: theme.text_color }}>I'm </span>
          Alessandro Pani
          <span style={{ color: theme.text_color }}>.</span>
          <span className='hover:animate-handwave origin-[70%_70%] inline-block'>👋</span>
        </span>
      </div>
    </div>
  )
}

function ProfileDescription({ theme }: { theme: any }) {
  const container = useRef(null)
  const q = gsap.utils.selector(container)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(q('span'), { autoAlpha: 0 }, { autoAlpha: 1, delay: 1.2, duration: 0.5 })
  }, [])

  return (
    <div ref={container} style={{ color: theme.sub_color }} className='text-sm lg:text-base 2xl:text-lg'>
      <span className='invisible'>
        Computer Science student (Universidad de Costa Rica) focused on machine-learning research and full-stack engineering — I run large empirical ML studies and ship production web apps end to end.
      </span>
    </div>
  )
}

function MagneticButton({ children }: { children: any }) {
  const ref = useRef<any>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    setPosition({ x: clientX - (left + width / 2), y: clientY - (top + height / 2) })
  }

  return (
    <motion.div
      className='flex items-center relative w-full'
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      animate={position}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

const ProfileLinkItem = ({ text, link, icon }: any) => (
  <div className='flex cursor-pointer'>
    <a href={link} aria-label={text} target='_blank'>
      <MagneticButton>
        {text}
        {icon}
      </MagneticButton>
    </a>
  </div>
)

const ProfileLink = React.forwardRef(({ theme }: { theme: any }, ref: any) => {
  const container = useRef(null)
  const q = gsap.utils.selector(container)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(
      q('a'),
      { autoAlpha: 0, x: -80 },
      { x: 0, autoAlpha: 1, duration: 0.2, ease: 'power2.inOut', stagger: 0.3, delay: 1.5 }
    )
  }, [])

  return (
    <div ref={container} style={{ color: theme.main_color }} className='flex gap-10 text-sm 2xl:text-sm'>
      <a className='flex items-center' download='Alessandro Pani Resume' href={resume} target='_blank'>
        Resume <Download strokeWidth={2} size={20} className='ml-2' />
      </a>
      <ProfileLinkItem text='LinkedIn' link='https://www.linkedin.com/in/alessandro-pani-931945245/' icon={<TriangleRightFill strokeWidth={2} size={20} className='ml-1' />} />
      <ProfileLinkItem text='Github' link='https://github.com/apani0409' icon={<TriangleRightFill strokeWidth={2} size={20} className='ml-1' />} />
      <a className='flex items-center' href='mailto:alessandro.pani1010@gmail.com' target='_blank'>
        Email <TriangleRightFill strokeWidth={2} size={20} className='ml-1' />
      </a>
    </div>
  )
})

function Accordion({ i, expanded, setExpanded, title, theme, order, children }: any) {
  const isOpen = i === expanded
  return (
    <>
      <motion.header
        style={{ color: theme.main_color }}
        onClick={() => setExpanded(isOpen ? false : i)}
        variants={{ open: { scale: 1, top: i * 100 + 100 }, collapsed: { scale: 0, top: -100 * i } }}
        initial='collapsed'
        animate='open'
        className='flex items-center justify-between text-5xl 2xl:text-5xl font-bold whitespace-nowrap'
      >
        {title}
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.5 }}>
          <TriangleRightFill strokeWidth={2} size={32} />
        </motion.span>
      </motion.header>
      <AnimatePresence mode='wait'>
        {isOpen && (
          <motion.section
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{ open: { opacity: 1, height: 'auto' }, collapsed: { opacity: 0, height: 0 } }}
            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ order }}
            className='overflow-y-scroll max-h-[20rem] 2xl:max-h-[30rem]'
          >
            {children}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}

export default function DesktopLayout() {
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState<false | number>(0)

  return (
    <div
      style={{ background: theme.background, transition: 'all .5s ease' }}
      className='min-h-screen h-full w-screen flex flex-col'
    >
      <div style={{ color: theme.main_color }} className='flex basis-10 p-3'>
        <ThemeDropdown />
      </div>

      <motion.div
        id='content_container'
        className='lg:max-w-[50%] min-h-screen h-full self-center flex flex-col lg:flex-row lg:grow items-center justify-center 2xl:mx-56 gap-10 2xl:gap-20 overflow-visible'
      >
        <div className='flex flex-1 flex-col gap-10'>
          <div className='h-56 w-56'>
            <StaticImage
              src='../images/self_photo.jpg'
              alt='Alessandro Pani photo'
              placeholder='blurred'
              layout='constrained'
              style={{ borderColor: theme.main_color }}
              className='h-full w-full object-cover border-solid border-4 rounded-full'
            />
          </div>

          <ProfileTitleHeader theme={theme} />
          <Divider theme={theme} />
          <ProfileDescription theme={theme} />
          <ProfileLink theme={theme} />
        </div>

        <motion.div
          variants={{ open: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } } }}
          animate='open'
          className='flex flex-1 flex-col text-center h-fit justify-center overflow-visible'
        >
          <Accordion i={0} expanded={expanded} setExpanded={setExpanded} title='EXPERIENCES' theme={theme} order={0}>
            <ExperienceMenu data={experiencesData} />
          </Accordion>
          <Accordion i={1} expanded={expanded} setExpanded={setExpanded} title='PROJECTS' theme={theme} order={1}>
            <ProjectCards data={projectsData} />
          </Accordion>
          <Accordion i={2} expanded={expanded} setExpanded={setExpanded} title='RESEARCH' theme={theme} order={2}>
            <div className='text-left flex flex-col gap-4' style={{ color: theme.text_color }}>
              <div>
                <span style={{ color: theme.main_color }} className='font-semibold'>Feature-wise Double Descent</span> — draft paper. 13,000+ training runs mapping the interpolation peak across model families; showed it is a spectral phenomenon, predictable without training any model.
              </div>
              <div>
                <span style={{ color: theme.main_color }} className='font-semibold'>conjetura-lab</span> — an automated graph-theory conjecturing engine (Graffiti / TxGraffiti style): enumerates graphs, computes invariants and refutes inequality conjectures overnight with an LLM in the loop.
              </div>
              <div>
                <span style={{ color: theme.main_color }} className='font-semibold'>Museo del Espacio Matemático</span> — 30+ interactive math &amp; physics visualizations controllable by webcam hand-tracking.
              </div>
            </div>
          </Accordion>
        </motion.div>
      </motion.div>

      <div style={{ color: theme.main_color }} className='basis-10 p-3'>
        <Footer />
      </div>
    </div>
  )
}
