"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useCallback, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import ImageViewer from "./ImageViewer"
import { useScrollInView } from '../../hooks/useScrollInView'
import OrangeLoadingCube from '../common/OrangeLoadingCube'
import BlurImage from '../BlurImage'
import { motion, AnimatePresence } from 'framer-motion'
import { getCDNUrl } from '../../utils/cdn'

interface ContentItem {
  image: string;
  title: string;
  description: string;
}

interface ContentSection {
  title: string;
  content: ContentItem[];
}

interface PDFSection {
  title: string;
  pdfUrl: string;
}

type Section = ContentSection | PDFSection;

interface Campaign {
  id: string;
  title: string;
  sections: Section[];
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  image: string
  onNext: () => void
  onPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
  projectId: string
}

// Extract AnimatedImage into a separate component
const AnimatedImage = ({ item, onImageClick }: { item: ContentItem; onImageClick: (src: string) => void }) => {
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div
      ref={ref}
      className={`group relative transform transition-all duration-500 ease-out mb-8
        ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      data-image-info={JSON.stringify(item)}
    >
      <div 
        className="relative cursor-zoom-in flex items-center justify-center"
        onClick={() => onImageClick(item.image)}
      >
        <div className="max-h-[60vh] md:max-h-[80vh] w-full flex items-center justify-center overflow-hidden">
          <BlurImage
            src={item.image}
            alt={item.title}
            width={3840}  
            height={2160}
            quality={100}
            priority={false}
            className="max-h-[60vh] md:max-h-[80vh] max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, 80vw"
            unoptimized={true}
            onClick={() => onImageClick(item.image)}
          />
        </div>
      </div>
      
      {/* Mobile caption - only visible on small screens */}
      <div className="md:hidden w-full px-2 pt-3">
        {item.title && <h4 className="text-base font-medium text-white/90 mb-1">{item.title}</h4>}
        {item.description && <p className="text-sm text-white/70">{item.description}</p>}
      </div>
    </div>
  );
};

// Extract AnimatedPDF into a separate component
const AnimatedPDF = ({ pdfUrl, title }: { pdfUrl: string; title: string }) => {
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const [isPDFLoading, setIsPDFLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Different param settings for mobile and desktop
  const mobileParams = "#view=FitH&toolbar=0&statusbar=0&messages=0&navpanes=0";
  const desktopParams = "#view=FitH&toolbar=0&navpanes=0&scrollbar=1";
  
  const pdfUrlWithParams = `${pdfUrl}${typeof window !== 'undefined' && window.innerWidth < 768 
    ? mobileParams 
    : desktopParams}`;

  useEffect(() => {
    // Reset loading state when PDF URL changes
    setIsPDFLoading(true);
    
    // Set a timeout to hide loading indicator after 3 seconds
    // even if PDF doesn't trigger load event
    const timer = setTimeout(() => {
      setIsPDFLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-500 ease-out w-full h-full
        ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      data-type="pdf-container"
      style={{ background: '#F9F9F9', height: '100%' }}
    >
      <div className="relative bg-[#F9F9F9] dark:bg-[#222222] retro-box w-full h-full rounded-lg overflow-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Mobile zoom controls */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 md:hidden">
          <button 
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
            className="bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button 
            onClick={() => setZoomLevel(1)} // Reset zoom
            className="bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            aria-label="Reset zoom"
          >
            <span className="text-xs px-1">100%</span>
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
            className="bg-black/40 hover:bg-black/60 p-2 rounded-full text-white"
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
        </div>
        
        {/* Loading indicator */}
        {isPDFLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        {/* The iframe with the PDF content */}
        <div 
          className="w-full h-full"
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            height: '100%',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <iframe
            src={pdfUrlWithParams}
            className="w-full h-full"
            style={{ 
              height: '100%',
              minHeight: typeof window !== 'undefined' && window.innerWidth >= 768 
                ? 'calc(92vh - 20px)' 
                : 'calc(65vh - 20px)',
              border: 'none',
              margin: 0,
              padding: 0,
              display: 'block',
              WebkitOverflowScrolling: 'touch',
              background: '#F9F9F9',
            }}
            title={`${title} presentation`}
            frameBorder="0"
            onLoad={() => setIsPDFLoading(false)}
            allow="fullscreen"
          />
        </div>
        
        {/* Mobile controls overlay */}
        <div className="md:hidden absolute bottom-4 right-4 flex items-center gap-2">
          {/* Download button */}
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full text-sm text-white flex items-center space-x-2"
            download
          >
            <span>Download</span>
          </a>
          {/* View in new tab button */}
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full text-sm text-white flex items-center space-x-2"
          >
            <span>Open PDF</span>
          </a>
        </div>
        
        {/* Desktop controls */}
        <div className="hidden md:flex absolute top-3 right-3 z-10 items-center gap-2">
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-black/30 hover:bg-black/50 px-3 py-2 rounded text-sm text-white flex items-center gap-2 transition-colors"
            download
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Update how active items are tracked with debounce to prevent flickering
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function ProjectModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  image,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  projectId
}: ProjectModalProps) {
  // Move all hooks to the top level
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isPDFVisible, setIsPDFVisible] = useState(false)
  // Track both current and previous items for smooth transitions
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null)
  const [previousItem, setPreviousItem] = useState<ContentItem | null>(null)
  const [isItemTransitioning, setIsItemTransitioning] = useState(false)
  // Add state for active PDF information
  const [activePDF, setActivePDF] = useState<{title: string, description: string} | null>(null)
  const [previousPDF, setPreviousPDF] = useState<{title: string, description: string} | null>(null)
  const [isPDFTransitioning, setIsPDFTransitioning] = useState(false)
  // Flag to prevent showing any image info when first loading
  const [hasScrolled, setHasScrolled] = useState(false)
  // Track scroll speed for dynamic scrolling adjustments
  const scrollSpeedTracker = useRef({ lastEvent: 0, speed: 0 })

  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Add this for single image animation
  const singleImageRef = useScrollInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      
      // Trigger animation after component mounts
      setTimeout(() => {
        setShowModal(true)
      }, 10)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen])

  const handleClose = () => {
    setShowModal(false)
    // Wait for animation to complete before unmounting
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // Handle click outside modal content
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose()
    }
  }

  if (!isOpen) return null;

  const dreamingCampaigns: Campaign[] = [
    {
      id: "campaign1",
      title: "Campaign One",
      sections: [
        {
          title: "Target Audience",
          content: [
            {
              image: "/placeholders/persona1.jpg",
              title: "Primary Persona",
              description: "Urban professionals, 25-35 years old"
            },
            {
              image: "/placeholders/persona2.jpg",
              title: "Secondary Persona",
              description: "Creative entrepreneurs, 30-40 years old"
            }
          ]
        },
        {
          title: "User Journey",
          content: [
            {
              image: "/placeholders/journey1.jpg",
              title: "Awareness Stage",
              description: "Initial touchpoints and discovery"
            },
            {
              image: "/placeholders/journey2.jpg",
              title: "Consideration",
              description: "Evaluation and comparison phase"
            }
          ]
        },
        {
          title: "Creative Development",
          content: [
            {
              image: "/placeholders/moodboard1.jpg",
              title: "Moodboard",
              description: "Visual direction and style exploration"
            },
            {
              image: "/placeholders/storyboard1.jpg",
              title: "Storyboard",
              description: "Campaign narrative visualization"
            }
          ]
        },
        {
          pdfUrl: "/placeholders/campaign1.pdf",
          title: "Full Presentation"
        }
      ]
    },
    {
      id: "campaign2",
      title: "Campaign Two",
      sections: [
        {
          title: "Target Audience",
          content: [
            {
              image: "/placeholders/persona3.jpg",
              title: "Primary Persona",
              description: "Young creatives, 20-30 years old"
            },
            {
              image: "/placeholders/persona4.jpg",
              title: "Secondary Persona",
              description: "Design enthusiasts, 25-35 years old"
            }
          ]
        },
        {
          title: "User Journey",
          content: [
            {
              image: "/placeholders/journey1.jpg",
              title: "Awareness Stage",
              description: "Initial touchpoints and discovery"
            },
            {
              image: "/placeholders/journey2.jpg",
              title: "Consideration",
              description: "Evaluation and comparison phase"
            }
          ]
        },
        {
          title: "Creative Development",
          content: [
            {
              image: "/placeholders/moodboard1.jpg",
              title: "Moodboard",
              description: "Visual direction and style exploration"
            },
            {
              image: "/placeholders/storyboard1.jpg",
              title: "Storyboard",
              description: "Campaign narrative visualization"
            }
          ]
        },
        {
          pdfUrl: "/placeholders/campaign2.pdf",
          title: "Full Presentation"
        }
      ]
    }
  ];

  const talesFromTheSunCampaign: Campaign = {
    id: "tales-from-sun",
    title: "Tales from the Sun",
    sections: [
      {
        title: "Target Audience & Personas",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/TalesFromTheSun/TargetAudience.jpg"),
            title: "Primary Persona - Young Urban Explorer",
            description: "25-34 years old, tech-savvy urban professionals seeking authentic experiences"
          }
        ]
      },
      {
        title: "Creative Development",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/TalesFromTheSun/CreativeIdea_Moodboard.jpg"),
            title: "Visual Direction",
            description: "Exploring color palettes, typography, and visual style"
          },
          {
            image: getCDNUrl("/Img_and_Vid/TalesFromTheSun/Storyboard_TalesFromTheSun.jpg"),
            title: "Campaign Storyboard",
            description: "Key visual moments and narrative flow"
          }
        ]
      },
      {
        title: "Full Presentation",
        pdfUrl: getCDNUrl("/Img_and_Vid/TalesFromTheSun/TalesFromTheSun.pdf")
      }
    ]
  };

  const bumbleGanttCampaign: Campaign = {
    id: "bumble-gantt",
    title: "BumbleGantt With The Wind",
    sections: [
      {
        title: "Target Audience & Personas",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/GanttWithTheWind/Persona_GanntWithTheWind_BMD2R1.jpg"),
            title: "Primary Persona - Project Manager",
            description: "25-45 years old, tech-savvy professionals managing multiple projects and teams"
          },
          {
            image: getCDNUrl("/Img_and_Vid/GanttWithTheWind/Persona2_GanntWithTheWind_BMD2R1.jpg"),
            title: "Secondary Persona - Team Lead",
            description: "30-50 years old, experienced leaders focusing on team coordination and delivery"
          }
        ]
      },
      {
        title: "Creative Development",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/GanttWithTheWind/MoodBoard.jpg"),
            title: "Visual Direction",
            description: "UI/UX design principles and visual identity"
          },
          {
            image: getCDNUrl("/Img_and_Vid/GanttWithTheWind/Storyboard_BumbleICK.jpg"),
            title: "User Flow Storyboard",
            description: "Key interaction points and workflow optimization"
          }
        ]
      },
      {
        title: "Full Presentation",
        pdfUrl: getCDNUrl("/Img_and_Vid/GanttWithTheWind/Creative-pitch_Gantt-with-the-wind.pdf")
      }
    ]
  };

  const highAltitudeCampaign: Campaign = {
    id: "high-altitude",
    title: "High Altitude Landscape",
    sections: [
      {
        title: "Project Images",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/HighAltitudeLandscape/HighAltitudeLandscape.jpg"),
            title: "High Altitude Landscape Design",
            description: "Modern landscape design with sustainable features"
          },
          {
            image: getCDNUrl("/Img_and_Vid/HighAltitudeLandscape/HighAltitudeLandscape2.jpg"),
            title: "Site Planning",
            description: "Detailed site analysis and planning"
          }
        ]
      }
    ]
  };

  const brightLightsCampaign: Campaign = {
    id: "painting-bright-lights",
    title: "Bright Lights",
    sections: [{
      title: "Project Images",
      content: [{
        image: getCDNUrl("/Img_and_Vid/PersonalPaintings/BrightLights.webp"),
        title: "Bright Lights",
        description: "Digital painting exploring urban nightlife and city illumination."
      }]
    }]
  };

  const photobashCampaign: Campaign = {
    id: "painting-photobash",
    title: "Photobash",
    sections: [{
      title: "Project Images",
      content: [{
        image: getCDNUrl("/Img_and_Vid/PersonalPaintings/photobash.webp"),
        title: "Photobash",
        description: "Mixed media digital artwork combining photography and painting."
      }]
    }]
  };

  const runCampaign: Campaign = {
    id: "painting-run",
    title: "Run",
    sections: [{
      title: "Project Images",
      content: [{
        image: "/Img_and_Vid/PersonalPaintings/Run(compressed).webp",
        title: "Run",
        description: "Dynamic action scene showcasing movement and energy."
      }]
    }]
  };

  const saddleRoadCampaign: Campaign = {
    id: "painting-saddle-road",
    title: "Saddle Road Quick Sketch",
    sections: [{
      title: "Project Images",
      content: [{
        image: getCDNUrl("/Img_and_Vid/PersonalPaintings/SaddleRoadQuickSketch.webp"),
        title: "Saddle Road Quick Sketch",
        description: "Quick study capturing the essence of a rural landscape."
      }]
    }]
  };

  const smokeAnimationCampaign: Campaign = {
    id: "SmokeAnimation",
    title: "Smoke Animation",
    sections: [
   
      {
        title: "Process & Development",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/Smoke/BearAndCharacterSketches.png"),
            title: "Character Design Studies",
            description: "Preparatory sketches and character explorations for the animation project"
          }
        ]
      },
      {
        title: "Video Projects",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/Smoke/Smoke.mp4"),
            title: "Full Smoke Animation",
            description: "Complete high-resolution simulation demonstrating advanced particle systems and dynamics"
          },
          {
            image: getCDNUrl("/Img_and_Vid/Smoke/BackhouseJakob_ANFX301_Project3.mp4"),
            title: "Animation Project Showcase",
            description: "Classroom project demonstrating technical skills in fluid simulation and environmental effects"
          }
        ]
      }
    ]
  };

  const creativeCodingCampaign: Campaign = {
    id: "CreativeCoding",
    title: "Creative Coding",
    sections: [
      {
        title: "Project Overview",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/Coded_Painting/output_3.png"),
            title: "Generative Art Composition",
            description: "Algorithmic artwork exploring emergent patterns and dynamic systems through code."
          }
        ]
      },
      {
        title: "Concept Development",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/Coded_Painting/output_1.png"),
            title: "Procedural Expression",
            description: "Exploring mathematical algorithms and their visual representation through creative coding."
          },
          {
            image: getCDNUrl("/Img_and_Vid/Coded_Painting/output_2.png"),
            title: "Digital Canvas Study",
            description: "Experimental studies of color theory and computational aesthetics."
          }
        ]
      },
      {
        title: "Technical Process",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/Coded_Painting/sketch_1.png"),
            title: "Algorithm Development",
            description: "Designing custom algorithms that blend mathematics and artistic principles."
          },
          {
            image: getCDNUrl("/Img_and_Vid/Coded_Painting/sketch_2.png"),
            title: "Parameter Exploration",
            description: "Testing different parameters and variables to achieve unique visual outcomes."
          }
        ]
      },
      {
        title: "Full Presentation",
        pdfUrl: getCDNUrl("/Img_and_Vid/CreativeCoding/CreativeCoding_Process.pdf")
      }
    ]
  };
  
  const illustrationCampaign: Campaign = {
    id: "Illustrations",
    title: "Illustrations & Paintings",
    sections: [
      {
        title: "Landscapes & Environments",
        content: [
          {
            image: "/Img_and_Vid/PersonalPaintings/HighaltitudeLandScape(compressed).webp",
            title: "High Altitude Landscape",
            description: "A serene mountain landscape capturing the majesty of high-altitude environments."
          },
          {
            image: getCDNUrl("/Img_and_Vid/PersonalPaintings/SaddleRoadQuickSketch.webp"),
            title: "Saddle Road Quick Sketch",
            description: "Quick study capturing the essence of a rural landscape."
          },
          {
            image: getCDNUrl("/Img_and_Vid/PersonalPaintings/New_Series.webp"),
            title: "Series Study #1",
            description: "First in a series exploring light and shadow in natural environments."
          }
        ]
      },
      {
        title: "Dynamic Scenes & Character Studies",
        content: [
          {
            image: "/Img_and_Vid/PersonalPaintings/Run(compressed).webp",
            title: "Run",
            description: "Dynamic action scene showcasing movement and energy."
          },
          {
            image: getCDNUrl("/Img_and_Vid/PersonalPaintings/BrightLights.webp"),
            title: "Bright Lights", 
            description: "Digital painting exploring urban nightlife and city illumination."
          },
          {
            image: getCDNUrl("/Img_and_Vid/PersonalPaintings/photobash.webp"),
            title: "Photobash",
            description: "Mixed media digital artwork combining photography and painting."
          }
        ]
      },
      {
        title: "Experimental Works",
        content: [
          {
            image: getCDNUrl("/Img_and_Vid/PersonalPaintings/11.png"),
            title: "Series Study #2",
            description: "Second piece exploring natural light phenomena."
          }
        ]
      }
    ]
  };

  const renderContentSection = (section: ContentSection) => {
    if (hasGridLayout(section)) {
      // Render as a grid
      return renderImageGrid(
        section.content.map(item => item.image),
        section.title
      );
    } else {
      // Render as normal content sections
      return (
        <div className="space-y-0">
          <h3 className="text-xl md:text-2xl font-semibold text-white/90 px-4 md:px-0 pt-4 md:hidden">{section.title}</h3>
          {section.content.map((item, i) => (
            <div 
              key={i} 
              className={`w-full h-[92vh] snap-start snap-always flex flex-col md:flex-row items-center justify-center ${
                item.image.endsWith('.mp4') || item.image.endsWith('.webm') 
                  ? 'py-0 md:py-0' 
                  : 'py-4 md:py-4'
              } px-4 md:px-14`}
              data-image-info={JSON.stringify(item)}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                {/* Image or Video */}
                <div className="w-full md:w-[90%] mx-auto flex items-center justify-center h-full">
                  {item.image.endsWith('.mp4') ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-full max-w-5xl mx-auto relative">
                        <video
                          src={item.image}
                          controls
                          autoPlay={false}
                          className="w-full h-auto max-h-[85vh] object-contain"
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    </div>
                  ) : item.image.endsWith('.webm') ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-full max-w-5xl mx-auto relative">
                        <video
                          src={item.image}
                          controls
                          autoPlay={false}
                          className="w-full h-auto max-h-[85vh] object-contain"
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    </div>
                  ) : (
                    <BlurImage
                      src={item.image}
                      alt={item.title}
                      width={2560}
                      height={1440}
                      quality={100}
                      className="w-auto max-w-full max-h-[75vh] object-contain cursor-zoom-in"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 85vw, 80vw"
                      unoptimized={true}
                      onClick={() => handleImageClick(item.image)}
                    />
                  )}
                </div>
                
                {/* Mobile caption - only visible on small screens */}
                <div className="md:hidden w-full px-4 pt-2">
                  {item.title && <h4 className="text-lg font-medium text-white/90 mb-1">{item.title}</h4>}
                  {item.description && <p className="text-sm text-white/70">{item.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  const renderPDFSection = (pdfUrl: string, title: string, parentTitle?: string) => (
    <div 
      className="w-full snap-start flex flex-col items-stretch justify-center py-0 md:py-6 m-0 md:px-14" 
      data-type="pdf-container" 
      data-pdf-title={title}
      data-parent-title={parentTitle || title}
      style={{ height: '92vh' }}
    >
      <h3 className="text-xl font-semibold text-white/90 mb-2 px-4 md:px-0 md:hidden">{title}</h3>
      <div className="w-full flex-1 h-full md:w-[95%] md:mx-auto">
        <AnimatedPDF pdfUrl={pdfUrl} title={title} />
      </div>
      {/* Mobile-only description - optional contextual information */}
      <div className="md:hidden w-full px-4 mt-2">
        <p className="text-sm text-white/70 text-center">
          <span className="inline-block bg-white/10 px-3 py-1 rounded-full">
            Tap the zoom controls to adjust the view
          </span>
        </p>
      </div>
    </div>
  );

  const renderDreamingContent = () => {
    return (
      <div className="space-y-0">
        {/* PDF Section */}
        {renderPDFSection("/pdfs/dreaming-case-study.pdf", "Creative Thinking Process", "Dreaming")}
        
        {/* Storyboard grid gallery with proper margins */}
        {renderImageGrid([
          "/images/projects/dreaming/frame1.jpg",
          "/images/projects/dreaming/frame2.jpg",
          "/images/projects/dreaming/frame3.jpg",
          "/images/projects/dreaming/frame4.jpg",
          "/images/projects/dreaming/frame5.jpg",
          "/images/projects/dreaming/frame6.jpg"
        ], "Storyboard Frames")}
        
        {/* Main video */}
        <div className="min-h-[60vh] md:h-[92vh] snap-start flex flex-col items-center justify-center py-6 md:py-6 md:px-14">
          <div className="w-full md:w-[95%] mx-auto h-full flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto relative" style={{paddingTop: '56.25%'}}>
              <iframe
                src="https://player.vimeo.com/video/898543194"
                className="absolute top-0 left-0 w-full h-full rounded-sm border border-white/10"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                title="Dreaming: A Visual Exploration"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreativeAdvertisingContent = () => {
    return (
      <div className="space-y-0">
        {talesFromTheSunCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              // Content section with proper margins, now using the enhanced renderer
              renderContentSection(section)
            ) : (
              // PDF section with proper margins
              renderPDFSection(section.pdfUrl, section.title, talesFromTheSunCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBumbleGanttContent = () => {
    return (
      <div className="space-y-0">
        {bumbleGanttCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              // Content section with proper margins, now using the enhanced renderer
              renderContentSection(section)
            ) : (
              // PDF section with proper margins
              renderPDFSection(section.pdfUrl, section.title, bumbleGanttCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCreativeCodingContent = () => {
    return (
      <div className="space-y-0">
        {creativeCodingCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              // Content section with proper margins, now using the enhanced renderer
              renderContentSection(section)
            ) : (
              // PDF section with proper margins
              renderPDFSection(section.pdfUrl, section.title, creativeCodingCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSmokeAnimationContent = () => {
    return (
      <div className="space-y-0">
        {smokeAnimationCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              // Content section with proper margins, now using the enhanced renderer
              renderContentSection(section)
            ) : (
              // PDF section with proper margins
              renderPDFSection(section.pdfUrl, section.title, smokeAnimationCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderIllustrationsContent = () => {
    return (
      <div className="space-y-0">
        {illustrationCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              <div className="space-y-0">
                <h3 className="text-xl md:text-2xl font-semibold text-white/90 px-4 md:px-0 pt-4 md:hidden">{section.title}</h3>
                {section.content.map((item, i) => (
                  <div 
                    key={i} 
                    className="w-full h-[92vh] snap-start snap-always flex flex-col md:flex-row items-center justify-center py-4 md:py-4 px-4 md:px-14"
                    data-image-info={JSON.stringify(item)}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      {/* Image */}
                      <div className="w-full md:w-[90%] mx-auto flex items-center justify-center h-full">
                        <BlurImage
                          src={item.image}
                          alt={item.title}
                          width={2560}
                          height={1440}
                          quality={100}
                          className="w-auto max-w-full max-h-[75vh] object-contain cursor-zoom-in"
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 85vw, 80vw"
                          unoptimized={true}
                          onClick={() => handleImageClick(item.image)}
                        />
                      </div>
                      
                      {/* Mobile caption - only visible on small screens */}
                      <div className="md:hidden w-full px-4 pt-2">
                        {item.title && <h4 className="text-lg font-medium text-white/90 mb-1">{item.title}</h4>}
                        {item.description && <p className="text-sm text-white/70">{item.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // PDF section with proper margins
              renderPDFSection(section.pdfUrl, section.title, illustrationCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleImageClick = (imageSrc: string) => {
    setEnlargedImage(imageSrc)
  }

  const handleTransition = (direction: 'left' | 'right', callback: () => void) => {
    setTransitionDirection(direction)
    setIsTransitioning(true)

    setTimeout(() => {
      callback()
      // Reset transition states after content changes
      setTimeout(() => {
        setIsTransitioning(false)
        setTransitionDirection(null)
      }, 50)
    }, 300) // Match animation duration
  }

  const handleNext = () => {
    if (hasNext && !isTransitioning) {
      handleTransition('left', onNext)
    }
  }

  const handlePrevious = () => {
    if (hasPrevious && !isTransitioning) {
      handleTransition('right', onPrevious)
    }
  }

  const renderSingleImage = () => (
    <div 
      className="w-full snap-start flex items-center justify-center py-10 md:py-16 px-4 md:px-14"
      data-image-info={JSON.stringify({ 
        image: image, 
        title: "", 
        description: "" 
      })}
    >
      <div className="w-full md:w-[90%] mx-auto flex items-center justify-center">
        <BlurImage
          src={image}
          alt={title}
          width={3840}
          height={2160}
          quality={100}
          className="w-auto max-w-full max-h-[70vh] md:max-h-[75vh] object-contain cursor-zoom-in"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 85vw, 80vw"
          unoptimized={true}
          onClick={() => handleImageClick(image)}
        />
      </div>
    </div>
  );

  const renderImageGridItem = (imageSrc: string, alt: string, onClick: () => void) => (
    <div className="p-3 md:p-5 flex items-center justify-center h-full w-full">
      <div className="overflow-hidden rounded border border-black/10 dark:border-white/10 h-full w-full">
        <BlurImage
          src={imageSrc}
          alt={alt}
          width={1200}
          height={800}
          quality={90}
          className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
          unoptimized={true}
          onClick={onClick}
        />
      </div>
    </div>
  );

  const renderImageGrid = (images: string[], title: string) => (
    <div className="w-full snap-start py-10 md:py-16 px-4 md:px-14 flex flex-col">
      <h3 className="text-xl font-semibold text-white/90 mb-4 px-4 md:px-0 md:hidden">{title}</h3>
      <div className="w-full flex items-center justify-center">
        <div className="w-full md:w-[90%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {images.map((img, idx) => (
            <div key={idx} className="bg-black/5 dark:bg-white/5 rounded-lg shadow-sm relative pb-[75%]">
              <div className="absolute inset-0">
                {renderImageGridItem(img, `${title} image ${idx+1}`, () => handleImageClick(img))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Add this function to check if the content has a grid layout
  const hasGridLayout = (section: ContentSection) => {
    // Check if section has a grid layout marker or multiple images that should be displayed in a grid
    return section.content.length > 2 || (section.title?.toLowerCase().includes('grid') || section.title?.toLowerCase().includes('gallery'));
  };

  const renderContent = () => {
    if (projectId === 'dreaming') {
      return renderDreamingContent();
    } else if (projectId === 'Creative Advertising') {
      return renderCreativeAdvertisingContent();
    } else if (projectId === 'BumbleGanttWithTheWind') {
      return renderBumbleGanttContent();
    } else if (projectId === 'CreativeCoding') {
      return renderCreativeCodingContent();
    } else if (projectId === 'SmokeAnimation') {
      return renderSmokeAnimationContent();
    } else if (projectId === 'Illustrations') {
      return renderIllustrationsContent();
    } else {
      // For projects with just a single image
      return renderSingleImage();
    }
  };

  // Track scroll position and set hasScrolled flag
  const handleScroll = useCallback((e: any) => {
    const target = e.target
    const scrollPercent = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100
    setScrollProgress(Math.min(scrollPercent, 100))
    
    // Set hasScrolled to true after first scroll
    if (!hasScrolled && target.scrollTop > 0) {
      setHasScrolled(true)
    }
  }, [hasScrolled])

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowRight':
          if (hasNext && !isTransitioning) handleNext()
          break
        case 'ArrowLeft':
          if (hasPrevious && !isTransitioning) handlePrevious()
          break
        case 'ArrowDown':
          if (contentRef.current) {
            contentRef.current.scrollBy({
              top: 300,
              behavior: 'auto'
            });
          }
          break
        case 'ArrowUp':
          if (contentRef.current) {
            contentRef.current.scrollBy({
              top: -300,
              behavior: 'auto'
            });
          }
          break
        case 'PageDown':
          if (contentRef.current) {
            contentRef.current.scrollBy({
              top: window.innerHeight * 0.8,
              behavior: 'auto'
            });
          }
          break
        case 'PageUp':
          if (contentRef.current) {
            contentRef.current.scrollBy({
              top: -window.innerHeight * 0.8,
              behavior: 'auto'
            });
          }
          break
        case 'Home':
          if (contentRef.current) {
            contentRef.current.scrollTo({
              top: 0,
              behavior: 'auto'
            });
          }
          break
        case 'End':
          if (contentRef.current) {
            contentRef.current.scrollTo({
              top: contentRef.current.scrollHeight,
              behavior: 'auto'
            });
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, hasNext, hasPrevious, isTransitioning])

  // Mount animation
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Trigger mount animation
      setTimeout(() => setIsMounted(true), 10)
      
      // Simulate loading state
      setTimeout(() => setIsLoading(false), 500)
    }

    return () => {
      document.body.style.overflow = 'unset'
      setIsMounted(false)
      setIsLoading(true)
    }
  }, [isOpen])

  // Add wheel event handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isOpen || !contentRef.current) return;
      
      // Prevent default scrolling behavior
      e.preventDefault();
      const content = contentRef.current;
      
      // Track scrolling speed for more responsive scrolling
      const now = Date.now();
      const timeDelta = now - scrollSpeedTracker.current.lastEvent;
      scrollSpeedTracker.current.lastEvent = now;
      
      // Check if cursor is directly over a PDF element
      const target = e.target as Element;
      const isOverPDF = target.closest('iframe') !== null;
      
      // If we're over a PDF iframe directly, let the PDF handle it
      if (isOverPDF) {
        // Don't do any special handling, let the default PDF behavior work
        return;
      }
      
      // Get the scroll delta and direction
      const scrollingDown = e.deltaY > 0;
      const scrollDelta = Math.abs(e.deltaY);
      
      // Always use high speed factor for immediate response
      const speedFactor = 3.0;
      const scrollBehavior: ScrollBehavior = 'auto';
      
      // Apply immediate scrolling regardless of image loading state
      content.scrollBy({
        top: (scrollingDown ? scrollDelta : -scrollDelta) * speedFactor,
        behavior: scrollBehavior
      });
      
      // Set flag that user has scrolled for activeItem detection
      if (!hasScrolled) {
        setHasScrolled(true);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, isPDFVisible, hasScrolled]);

  // Add touch event handlers for mobile
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    let startY = 0;
    let startX = 0;
    let startTime = 0;
    const touchThreshold = 5; // Reduced threshold for more responsive touch
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startY = touch.clientY;
      startX = touch.clientX;
      startTime = Date.now();
      
      // If we're touching a PDF iframe, don't interfere
      if ((e.target as Element).closest('iframe')) {
        return;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // If we're touching a PDF iframe, don't interfere
      if ((e.target as Element).closest('iframe')) {
        return;
      }
      
      if (!contentRef.current) return;
      
      const touch = e.touches[0];
      const deltaY = startY - touch.clientY;
      const deltaX = startX - touch.clientX;
      
      // If horizontal swipe is greater than vertical, it might be a navigation gesture
      if (Math.abs(deltaX) > Math.abs(deltaY) + touchThreshold) {
        if (Math.abs(deltaX) > 50) {
          e.preventDefault();
          return;
        }
      }
      
      // Vertical scrolling - more responsive
      if (Math.abs(deltaY) > touchThreshold) {
        e.preventDefault();
        contentRef.current.scrollBy({
          top: deltaY * 1.5, // Increased multiplier for faster response
          behavior: 'auto' // Always use auto for immediate response
        });
        
        // Update start position for continuous movement
        startY = touch.clientY;
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      // If we're touching a PDF iframe, don't interfere
      if ((e.target as Element).closest('iframe')) {
        return;
      }
      
      const endTime = Date.now();
      const timeElapsed = endTime - startTime;
      
      // Handle swipe navigation (left/right)
      if (e.changedTouches.length) {
        const touch = e.changedTouches[0];
        const deltaX = startX - touch.clientX;
        const deltaY = startY - touch.clientY;
        
        // Only consider horizontal swipes if they're more pronounced than vertical ones
        if (Math.abs(deltaX) > Math.abs(deltaY) + 20 && Math.abs(deltaX) > 80 && timeElapsed < 300) {
          if (deltaX > 0 && hasNext && !isTransitioning) {
            // Swipe left, go to next
            handleNext();
          } else if (deltaX < 0 && hasPrevious && !isTransitioning) {
            // Swipe right, go to previous
            handlePrevious();
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, isPDFVisible, hasScrolled]);

  // Helper function to update active PDF - MOVED UP BEFORE BEING USED
  const updateActivePDF = useCallback((pdfTitle: string, mainTitle: string) => {
    // Create description for PDF
    const pdfInfo = {
      title: pdfTitle || "Presentation",
      description: `${mainTitle} - Full presentation document`
    };
    
    if (!activePDF || activePDF.title !== pdfInfo.title) {
      if (activePDF) {
        setPreviousPDF(activePDF);
        setIsPDFTransitioning(true);
        
        setTimeout(() => {
          setIsPDFTransitioning(false);
        }, 100); // Reduced from 150ms for snappier transitions
      }
      
      setActivePDF(pdfInfo);
      
      // When PDF becomes active, clear any image item that might be active
      if (activeItem) {
        setPreviousItem(activeItem);
        setIsItemTransitioning(true);
        setTimeout(() => {
          setIsItemTransitioning(false);
          setActiveItem(null);
        }, 100); // Reduced from 150ms for snappier transitions
      }
    }
  }, [activePDF, activeItem]);

  // Update the updateActiveItem function with faster transition
  const updateActiveItem = useCallback((newItem: ContentItem) => {
    // Only update if we have an actual item to display and user has scrolled
    if (newItem && newItem.title && hasScrolled) {
      // Prevent re-renders for the same item
      if (!activeItem || activeItem.image !== newItem.image) {
        // Store previous item before updating to new one (for transition)
        if (activeItem) {
          setPreviousItem(activeItem);
          setIsItemTransitioning(true);
          
          // After delay, complete transition (reduced from 150ms to 100ms for snappier transitions)
          setTimeout(() => {
            setIsItemTransitioning(false);
          }, 100);
        }
        
        // Update to new item
        setActiveItem(newItem);
      }
    }
  }, [activeItem, hasScrolled]);
  
  // Update the PDF intersection observer to track PDF metadata
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target.getAttribute('data-type') === 'pdf-container') {
            // Only update the state if the visibility is actually changing
            if (entry.isIntersecting !== isPDFVisible) {
              setIsPDFVisible(entry.isIntersecting);
              
              if (entry.isIntersecting) {
                // Get PDF title and parent title from data attributes
                const pdfTitle = entry.target.getAttribute('data-pdf-title') || "";
                const parentTitle = entry.target.getAttribute('data-parent-title') || "";
                
                // Update active PDF info
                updateActivePDF(pdfTitle, parentTitle);
                
                // When entering a PDF section, scroll slightly to ensure it's properly positioned
                if (contentRef.current) {
                  // Small delay to ensure the UI has updated
                  setTimeout(() => {
                    contentRef.current?.scrollBy({
                      top: 10, // Just enough to trigger proper positioning
                      behavior: 'auto'
                    });
                  }, 100);
                }
              } else {
                // When leaving PDF, we could clear the active PDF info or keep it
                // For now, we'll just leave it as is and let the next item replace it
              }
            }
          }
        });
      },
      { 
        threshold: 0.3, // PDF detection threshold
        root: contentRef.current
      }
    );

    const pdfElements = contentRef.current.querySelectorAll('[data-type="pdf-container"]');
    pdfElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [isPDFVisible, contentRef, updateActivePDF]);

  // Modify the intersection observer effect for better stability
  useEffect(() => {
    if (!contentRef.current) return;
    
    let debounceTimer: ReturnType<typeof setTimeout>;
    let bestItem: ContentItem | null = null;
    let highestRatio = 0;
    
    // Create observer with root as the content container
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            const el = entry.target as HTMLElement;
            const dataAttr = el.getAttribute('data-image-info');
            
            if (dataAttr) {
              try {
                const itemData = JSON.parse(dataAttr) as ContentItem;
                bestItem = itemData;
              } catch (e) {
                console.error('Error parsing image info:', e);
              }
            }
          }
        });
        
        // Clear any existing debounce timer
        clearTimeout(debounceTimer);
        
        // Set a new debounce timer to prevent rapid updates during scrolling
        debounceTimer = setTimeout(() => {
          if (bestItem && bestItem.title && bestItem.image && highestRatio > 0.5) {
            updateActiveItem(bestItem);
          }
          // Reset for next observation cycle
          bestItem = null;
          highestRatio = 0;
        }, 100); // 100ms debounce
      },
      {
        root: contentRef.current,
        rootMargin: '0px',
        threshold: [0.25, 0.5, 0.75, 0.9]
      }
    );
    
    // Observe all elements with data-image-info attribute
    const elements = contentRef.current.querySelectorAll('[data-image-info]');
    elements.forEach(el => observer.observe(el));
    
    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [contentRef.current, hasScrolled, updateActiveItem]);

  return (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90
        backdrop-blur-sm transition-all duration-300
        ${isMounted ? 'opacity-100' : 'opacity-0'}
        ${showModal ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={handleOverlayClick}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800">
        <div 
          className="h-full bg-white transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Close button with improved hit area */}
      <button 
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 p-3 rounded-full
          bg-black/50 hover:bg-black/70 transition-all duration-200
          hover:scale-110 active:scale-95"
        aria-label="Close modal"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Navigation buttons with improved feedback */}
      <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
        <button 
          onClick={handlePrevious}
          className={`pointer-events-auto p-4 md:p-5 rounded-full transform transition-all md:ml-3
            ${hasPrevious 
              ? 'opacity-80 hover:opacity-100 hover:scale-110 translate-x-0' 
              : 'opacity-40 cursor-not-allowed -translate-x-full'
            }`}
          disabled={!hasPrevious || isTransitioning}
          aria-label="Previous project"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
        
        <button 
          onClick={handleNext}
          className={`pointer-events-auto p-4 md:p-5 rounded-full transform transition-all md:mr-3
            ${hasNext 
              ? 'opacity-80 hover:opacity-100 hover:scale-110 translate-x-0' 
              : 'opacity-40 cursor-not-allowed translate-x-full'
            }`}
          disabled={!hasNext || isTransitioning}
          aria-label="Next project"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      </div>

      {/* Modal content with loading state - Responsive layout */}
      <div className="flex flex-col md:flex-row w-full h-[92vh] max-w-[95vw] mx-auto px-3">
        {/* Title and description for mobile - only visible on small screens */}
        <div className="md:hidden w-full py-4">
          <div className="text-left transform transition-all duration-300
            ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}">
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/80 mb-2">{description}</p>
          </div>
        </div>

        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className={`w-full md:w-[75%] max-h-[92vh] overflow-y-auto relative md:pr-4 snap-y snap-mandatory
            ${showModal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            transition-all duration-300 overscroll-contain
            scroll-smooth scroll-pt-0
            [-ms-overflow-style:none] [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
            [will-change:scroll-position] [backface-visibility:hidden]
            [perspective:1000px] [transform:translate3d(0,0,0)]
            [scroll-snap-type:y_mandatory]`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center mt-16">
              <OrangeLoadingCube transitionState={isLoading ? 'visible' : 'exiting'} />
            </div>
          ) : (
            <div className={`transform transition-all duration-300
              ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {renderContent()}
            </div>
          )}
        </div>

        {/* Title and description column on the right - hidden on mobile */}
        <div className="hidden md:block md:w-[25%] md:pl-4 flex flex-col max-h-[92vh] overflow-y-auto
          [-ms-overflow-style:none] [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden">
          <div className="text-left transform transition-all duration-300
            ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h2>
            <p className="text-base text-white/80 mb-6">{description}</p>
            
            {/* Current image information with transition effect */}
            <div className="mt-4 border-t border-white/10 pt-4 min-h-[100px] relative">
              {/* When transitioning out, show previous item fading out - improved transition */}
              {isItemTransitioning && previousItem && previousItem.title && (
                <div 
                  key={`prev-${previousItem.image}`} 
                  className="absolute inset-0 transition-all duration-100 ease-in-out transform opacity-0 -translate-y-1"
                  style={{ 
                    animationFillMode: 'forwards'
                  }}
                >
                  <h3 className="font-mono text-lg font-bold text-white mb-1">{previousItem.title}</h3>
                  {previousItem.description && (
                    <p className="text-sm text-white/80">{previousItem.description}</p>
                  )}
                </div>
              )}
              
              {/* Show PDF information when PDF is visible - improved transition */}
              {isPDFVisible && activePDF && (
                <div 
                  key={`pdf-${activePDF.title}`} 
                  className={`transition-all duration-200 ease-out transform 
                    ${isPDFTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                >
                  <h3 className="font-mono text-lg font-bold text-white mb-1">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                      <span className="transition-transform duration-200 ease-out">{activePDF.title}</span>
                    </span>
                  </h3>
                  <p className="text-sm text-white/80 transition-all duration-300 ease-out"
                    style={{ 
                      transitionDelay: '50ms'
                    }}
                  >{activePDF.description}</p>
                </div>
              )}
              
              {/* When not transitioning or after delay, show current item - improved transition */}
              {activeItem && activeItem.title && activeItem.title !== projectId && !isPDFVisible && (
                <div 
                  key={activeItem.image} 
                  className={`transition-all duration-200 ease-out transform
                    ${isItemTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                  style={{ 
                    animationDelay: '0s'
                  }}
                >
                  <h3 className="font-mono text-lg font-bold text-white mb-1 transition-all duration-200">{activeItem.title}</h3>
                  {activeItem.description && (
                    <p className="text-sm text-white/80 transition-all duration-300"
                      style={{ 
                        transitionDelay: '50ms'
                      }}
                    >{activeItem.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image viewer */}
      {enlargedImage && (
        <ImageViewer 
          src={enlargedImage} 
          onClose={() => setEnlargedImage(null)} 
          alt={title}
        />
      )}
    </div>
  )
}