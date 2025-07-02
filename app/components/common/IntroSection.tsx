'use client'

import AnimatedText from '../../utils/AnimatedText'
import { motion } from 'framer-motion'

export default function IntroSection() {
  return (
    <section className="text-center mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <AnimatedText text="Jakob Backhouse" />
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          <AnimatedText 
            text="I'm a multidisciplinary designer weaving stories through illustration, 
            animation, and creative advertising. My work transforms ideas into visuals 
            that captivate and inspire—let's bring your vision to life."
            variant="fast"
          />
        </p>
      </motion.div>
    </section>
  )
}
