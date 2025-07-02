'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue } from 'framer-motion'

import { sendEmail } from './actions'
import BackgroundSprites from '../components/animations/BackgroundSprites'
import { RotateCcw } from 'lucide-react'

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isDraggable, setIsDraggable] = useState(false)
  const [hasBeenDragged, setHasBeenDragged] = useState(false)
  const [zIndexes, setZIndexes] = useState({
    infoBox: 10,
    formBox: 10
  });

  // Add a base z-index counter to ensure proper stacking
  const [baseZIndex, setBaseZIndex] = useState(10);
  const [isDragging, setIsDragging] = useState(false);

  // Motion values for drag positions
  const infoBoxX = useMotionValue(0)
  const infoBoxY = useMotionValue(0)
  const formBoxX = useMotionValue(0)
  const formBoxY = useMotionValue(0)

  type DragKey = 'infoBox' | 'formBox'
  const [activeDragKey, setActiveDragKey] = useState<DragKey | null>(null);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check if on desktop
    const checkIfDesktop = () => {
      setIsDraggable(window.innerWidth >= 1024);
    };

    // Initial check
    checkDarkMode();
    checkIfDesktop();

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listen for window resize
    window.addEventListener('resize', checkIfDesktop);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkIfDesktop);
    };
  }, []);

  const resetPositions = () => {
    infoBoxX.set(0); infoBoxY.set(0);
    formBoxX.set(0); formBoxY.set(0);
    setHasBeenDragged(false);
  };

  // Utility to bring the dragged element to front
  const bringToFront = (key: keyof typeof zIndexes) => {
    setBaseZIndex(prev => prev + 1);
    setZIndexes(prev => {
      const newZIndexes = { ...prev };
      // Reset all other elements to base z-index
      Object.keys(newZIndexes).forEach(k => {
        if (k !== key) {
          newZIndexes[k as keyof typeof zIndexes] = baseZIndex;
        }
      });
      // Set the dragged element to the new highest z-index
      newZIndexes[key] = baseZIndex + 1;
      return newZIndexes;
    });
  };

  // Handle drag end with improved cleanup
  const onDragEnd = () => {
    setIsDragging(false);
    setActiveDragKey(null);
    // Reset z-indices after drag is complete
    setZIndexes(prev => {
      const newZIndexes = { ...prev };
      Object.keys(newZIndexes).forEach(k => {
        newZIndexes[k as keyof typeof zIndexes] = baseZIndex;
      });
      return newZIndexes;
    });
  };

  const handleDragStart = (key: DragKey) => () => {
    setIsDragging(true);
    setActiveDragKey(key);
    bringToFront(key);
    if (!hasBeenDragged) setHasBeenDragged(true);
  };

  // Calculate drag constraints based on viewport
  const getDragConstraints = () => {
    if (typeof window === 'undefined') return { left: -100, right: 100, top: -100, bottom: 100 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      left: -vw * 0.3,
      right: vw * 0.3,
      top: -vh * 0.3,
      bottom: vh * 0.3
    };
  };

  // Add a drag handle component for reuse
  const DragHandle = () => (
    <div className="absolute top-2 right-2 cursor-move opacity-40 hover:opacity-100 z-20">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" />
        <path d="M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z" fill="currentColor" />
        <path d="M12 21C13.1046 21 14 20.1046 14 19C14 17.8954 13.1046 17 12 17C10.8954 17 10 17.8954 10 19C10 20.1046 10.8954 21 12 21Z" fill="currentColor" />
        <path d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14Z" fill="currentColor" />
        <path d="M5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7Z" fill="currentColor" />
        <path d="M5 21C6.10457 21 7 20.1046 7 19C7 17.8954 6.10457 17 5 17C3.89543 17 3 17.8954 3 19C3 20.1046 3.89543 21 5 21Z" fill="currentColor" />
        <path d="M19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14Z" fill="currentColor" />
        <path d="M19 7C20.1046 7 21 6.10457 21 5C21 3.89543 20.1046 3 19 3C17.8954 3 17 3.89543 17 5C17 6.10457 17.8954 7 19 7Z" fill="currentColor" />
        <path d="M19 21C20.1046 21 21 20.1046 21 19C21 17.8954 20.1046 17 19 17C17.8954 17 17 17.8954 17 19C17 20.1046 17.8954 21 19 21Z" fill="currentColor" />
      </svg>
    </div>
  );

  // Helper to determine if an element should be draggable (allows active element while blocking others)
  const isElementDraggable = (key: DragKey) => {
    if (!isDraggable) return false;
    if (activeDragKey === null) return true; // Nothing is currently being dragged
    return activeDragKey === key; // Only the active element can continue to drag
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Create FormData from the form fields
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('message', formData.message);
      
      // Send the email using the server action
      const result = await sendEmail(formDataToSend);
      
      if (result.success) {
        setFormSubmitted(true)
      } else {
        setSubmitError(result.error || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F1E9] dark:bg-[#1A1818] grid-pattern relative">
      {/* Background Sprites */}
      <BackgroundSprites />
      
      <main className="pt-32 md:pt-40 pb-20 max-w-6xl mx-auto px-6 md:flex md:gap-8 relative">
        {/* Reset button (appears after dragging) */}
        {hasBeenDragged && isDraggable && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.7, y: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            onClick={resetPositions}
            className="fixed bottom-6 right-6 bg-white dark:bg-[#2A2A2A] p-2 rounded-full border-2 border-black dark:border-white z-50 shadow-md"
            title="Reset positions"
          >
            <RotateCcw size={16} />
          </motion.button>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1, 
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
            transition: { delay: 0.2, duration: 0.5 }
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-8 mb-12 md:mb-0 md:w-[400px] md:flex-shrink-0 border-2 relative z-10 cursor-move transition-all duration-300"
          style={{ 
            backgroundColor: isDarkMode ? '#1A1818' : '#F3F1E9',
            borderColor: 'rgba(0, 0, 0, 0)',
            zIndex: zIndexes.infoBox,
            pointerEvents: isDragging && activeDragKey !== 'infoBox' ? 'none' : 'auto',
            x: infoBoxX,
            y: infoBoxY
          }}
          whileHover={{ 
            borderColor: '#f97316',
            transition: { duration: 0.3 }
          }}
          drag={isElementDraggable('infoBox')}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={getDragConstraints()}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          onDragStart={handleDragStart('infoBox')}
          onDragEnd={onDragEnd}
        >
          {isDraggable && <DragHandle />}
          
          <div className="flex flex-col h-full">
            <motion.div 
              className="border-b-2 mb-8 pb-4"
              style={{ borderBottomColor: 'rgba(0, 0, 0, 0)' }}
              animate={{ 
                borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                transition: { delay: 0.3, duration: 0.5 }
              }}
            >
              <h1 className="font-mplus text-4xl md:text-5xl text-primary dark:text-primary-light">
                Get in Touch
              </h1>
            </motion.div>
            
            <div className="flex-grow font-satoshi mb-8">
              <p className="text-lg text-dark dark:text-light">
                Please don't hesitate to reach out with any thoughts or inquiries.
              </p>
            </div>
            
            <motion.a 
              href="mailto:jakobbackhouse@gmail.com" 
              className="block w-full px-6 py-3 bg-[#FFFFFF] text-black font-medium text-center
                hover:border-orange-500
                transition-all border-2 font-satoshi"
              style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
              animate={{ 
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                transition: { delay: 0.4, duration: 0.5 }
              }}
            >
              jakobbackhouse@gmail.com
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1, 
          }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="md:flex-1 relative"
          drag={isElementDraggable('formBox')}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={getDragConstraints()}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          onDragStart={handleDragStart('formBox')}
          onDragEnd={onDragEnd}
          style={{ 
            zIndex: zIndexes.formBox,
            pointerEvents: isDragging && activeDragKey !== 'formBox' ? 'none' : 'auto',
            x: formBoxX,
            y: formBoxY
          }}
        >
          {!formSubmitted ? (
            <motion.div 
              className="p-8 border-2 relative z-10 cursor-move hover:border-orange-500 transition-all duration-300"
              style={{ 
                backgroundColor: isDarkMode ? '#1A1818' : '#F3F1E9',
                borderColor: 'rgba(0, 0, 0, 0)'
              }}
              animate={{ 
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                transition: { delay: 0.3, duration: 0.5 }
              }}
            >
              {isDraggable && <DragHandle />}
              <form onSubmit={handleSubmit} className="space-y-6 font-satoshi">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-dark dark:text-light">
                    Name *
                  </label>
                  <motion.input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-2 bg-[#F3F1E9] dark:bg-[#1A1818] 
                      text-dark dark:text-light focus:outline-none focus:ring-0
                      hover:border-orange-500
                      transition-all border-2"
                    placeholder="Your Name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                    animate={{ 
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                      transition: { delay: 0.4, duration: 0.5 }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-dark dark:text-light">
                    Email Address *
                  </label>
                  <motion.input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-2 bg-[#F3F1E9] dark:bg-[#1A1818] 
                      text-dark dark:text-light focus:outline-none focus:ring-0
                      hover:border-orange-500
                      transition-all border-2"
                    placeholder="Your Email Address..."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                    animate={{ 
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                      transition: { delay: 0.5, duration: 0.5 }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-dark dark:text-light">
                    Message *
                  </label>
                  <motion.textarea
                    id="message"
                    required
                    rows={6}
                    className="w-full px-4 py-2 bg-[#F3F1E9] dark:bg-[#1A1818] 
                      text-dark dark:text-light focus:outline-none focus:ring-0
                      hover:border-orange-500
                      transition-all border-2"
                    placeholder="Your Message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                    animate={{ 
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                      transition: { delay: 0.6, duration: 0.5 }
                    }}
                  />
                </div>

                {submitError && (
                  <div className="text-red-500 text-sm py-2">
                    {submitError}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[#FFFFFF] text-black font-medium 
                    hover:border-orange-500
                    transition-all border-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                  animate={{ 
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                    transition: { delay: 0.7, duration: 0.5 }
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message →'}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              className="p-8 border-2 relative z-10 cursor-move hover:border-orange-500 transition-all duration-300"
              style={{ 
                backgroundColor: isDarkMode ? '#1A1818' : '#F3F1E9',
                borderColor: 'rgba(0, 0, 0, 0)'
              }}
              animate={{ 
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                transition: { delay: 0.3, duration: 0.5 }
              }}
            >
              {isDraggable && <DragHandle />}
              <div className="text-center space-y-4">
                <motion.div 
                  className="inline-block bg-green-500 text-white p-4 mb-4 border-2"
                  style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                  animate={{ 
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                    transition: { delay: 0.4, duration: 0.5 }
                  }}
                >
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="font-mplus text-2xl text-dark dark:text-light">
                  Message Sent Successfully!
                </h3>
                <p className="font-satoshi text-secondary dark:text-secondary-light">
                  Thanks for reaching out. I'll get back to you as soon as possible.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}