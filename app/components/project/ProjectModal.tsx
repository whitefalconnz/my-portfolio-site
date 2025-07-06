"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useCallback, useRef } from "react"
import ImageViewer from "./ImageViewer"
import { useScrollInView } from "../../hooks/useScrollInView"
import OrangeLoadingCube from '../common/OrangeLoadingCube'
import BlurImage from '../BlurImage'
import { getCDNUrl } from '../../utils/cdn'
import { createPortal } from "react-dom"

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

// Move campaign definitions outside component to prevent recreation on every render
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
        title: "Storyboard",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751411927/Storyboard_TalesFromTheSun_scq8sx.webp",
            title: "Tales from the Sun Storyboard",
            description: "Complete storyboard for the Tales from the Sun project"
          }
        ]
      },
      {
        title: "Campaign Strategy",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751786770/TheIssueTalesFromTheSun_mw3w92.webp",
            title: "The Issue",
            description: "Problem statement and market context for the campaign"
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751786770/InsightTalesFromTheSun_ewdmrr.webp",
            title: "Campaign Insight",
            description: "Core insight driving the Tales from the Sun campaign strategy"
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751786770/SingleMindedMessageTalesFromTheSun_xdw2ad.webp",
            title: "Single Minded Message",
            description: "The focused message that drives all campaign communications"
          }
        ]
      }
    ]
  };

  const bumbleGanttCampaign: Campaign = {
    id: "bumble-gantt",
    title: "Bumble ICK Campaign",
    sections: [
      {
        title: "Storyboards",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751495046/Storyboard_BumbleICK_2_ixhgy6.webp",
            title: "BumbleICK Storyboard",
            description: "This campaign was a mock collaboration with Bumble to promote their app. The insight that the campaign was based on was that Gen Z develop ICKS as an excuse for human imperfections. So we wanted to promote Bumble as an open and safe platform to talk about vulnerability. We created this Australian 'health and safety' tradie character that compassionately and humorously diagnoses ICKS and then explains how Bumble can help."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751763379/GenZDevelopsICKSSlide_khrq8c.webp",
            title: "Insight",
            description: "This campaign was a mock collaboration with Bumble to promote their app. The insight that the campaign was based on was that Gen Z develop ICKS as an excuse for human imperfections. So we wanted to promote Bumble as an open and safe platform to talk about vulnerability. We created this Australian 'health and safety' tradie character that compassionately and humorously diagnoses ICKS and then explains how Bumble can help."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751761838/KickTheIckSlide_kizwle.webp",
            title: "ICK Billboard",
            description: "Campaign billboard design for the BumbleGantt campaign. We wanted to create a billboard that would be funny and engaging for the target audience. Something that felt almost inappropriate so that it would stand out and get people talking."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751763379/CatchingIcksIsBadForYou_nvfjdh.webp",
            title: "Campaign Concept",
            description: "This campaign was a mock collaboration with Bumble to promote their app. The insight that the campaign was based on was that Gen Z develop ICKS as an excuse for human imperfections. So we wanted to promote Bumble as an open and safe platform to talk about vulnerability. We created this Australian 'health and safety' tradie character that compassionately and humorously diagnoses ICKS and then explains how Bumble can help."
          },
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

  const smokeAnimationCampaign: Campaign = {
    id: "SmokeAnimation",
    title: "Smoke Animation",
    sections: [
      {
        title: "Final Animation",
        content: [
          {
            image: "https://player.vimeo.com/video/913926901?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1",
            title: "Smoke Animation",
            description: "Complete high-resolution smoke simulation demonstrating advanced particle systems and fluid dynamics"
          }
        ]
      },
      {
      title: "Storyboard",
        content: [
          {
          image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751407939/StoryBoard_smnjuy.webp",
          title: "Storyboard Overview",
          description: "Initial storyboard layout and sequence planning for the animation"
        },
        {
          image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751407939/StoryBoard1_fhnylz.webp",
          title: "Storyboard Panel 1",
          description: "Opening sequence and character introduction"
        },
        {
          image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751407963/StoryBoard3_alv2ma.webp",
          title: "Storyboard Panel 3",
          description: "Key action sequences and narrative progression"
        },
        {
          image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751407940/StoryBoard4_qgslz3.webp",
          title: "Storyboard Panel 4",
          description: "Climactic moments and visual storytelling conclusion"
          }
        ]
      },
      {
      title: "Blender Tunnel Scene",
        content: [
          {
          image: getCDNUrl("/Img_and_Vid/Smoke/BackhouseJakob_ANFX301_Project3.mp4"),
          title: "Tunnel Environment",
          description: "3D environment modeling and lighting setup in Blender"
        }
      ]
    },
    {
      title: "Backgrounds in Blender",
        content: [
          {
          image: getCDNUrl("/Img_and_Vid/Smoke/BackhouseJakob_ANFX301_Project3.mp4"),
          title: "Background Environments",
          description: "Environmental design and background asset creation in Blender"
          }
        ]
      },
      {
      title: "Character Sheets",
        content: [
          {
          image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751409305/CharacterLookDevelopment_dphv2g.webp",
          title: "Character Look Development",
          description: "Character design exploration and visual development process"
        },
        {
          image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751409306/BearAndCharacterSketches_xflyxp.webp",
          title: "Bear and Character Sketches",
          description: "Preparatory sketches and character explorations for the animation project"
          }
        ]
      },
      {
      title: "Experimental Animation",
        content: [
          {
          image: getCDNUrl("/Img_and_Vid/Smoke/BackhouseJakob_ANFX301_Project3.mp4"),
          title: "Animation Experiments",
          description: "Technical experiments in fluid simulation and environmental effects"
        }
      ]
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
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750647646/HighaltitudeLandScape_compressed_pfsjjx.webp",
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
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750647370/Run_compressed_ycwwxf.webp",
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

  const tagCampaign: Campaign = {
    id: "Tag",
    title: "Tag",
    sections: [
      {
        title: "Main Trailer",
        content: [
          {
            image: "https://player.vimeo.com/video/1093033927?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1",
            title: "Tag Trailer",
            description: "Official trailer showcasing the animated short film's key moments and visual style."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/video/upload/v1751503774/TagFullAnimatic_1_sbyfhg.webm",
            title: "Tag Full Animatic",
            description: "Complete animatic showing the full story sequence and timing for the Tag animated short film."
          }
        ]
      },
      {
        title: "Backgrounds",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502491/Background1_bqz4j7.webp",
            title: "Background 1",
            description: "Environmental background design for the animated sequence."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502499/Background2_pcd0wt.webp",
            title: "Background 2",
            description: "Secondary background environment showcasing different locations."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502495/Background3_pzeikf.webp",
            title: "Background 3",
            description: "Third background design exploring varied environmental settings."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502498/Background4_lyal5h.webp",
            title: "Background 4",
            description: "Fourth background environment design for story progression."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502482/Background5.75_xsoji5.webp",
            title: "Background 5.75",
            description: "Intermediate background design variation for smooth transitions."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502481/Background5_ndu6r3.webp",
            title: "Background 5",
            description: "Fifth background environment showcasing key story moments."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502494/Background5.5_wvra0h.webp",
            title: "Background 5.5",
            description: "Mid-sequence background variation for narrative continuity."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502483/Background6_sp0rfn.webp",
            title: "Background 6",
            description: "Sixth background design featuring climactic scene environments."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751502492/Background7_s1wbzr.webp",
            title: "Background 7",
            description: "Final background design concluding the environmental sequence."
          }
        ]
      },
      {
        title: "Character Development",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730592/Character_Model_Sheet_Sketches_q8gmcr.webp",
            title: "Character Model Sheet Sketches",
            description: "Initial character design explorations and construction sketches."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730593/CharacterColourPicking_swb8uu.webp",
            title: "Character Color Picking",
            description: "Color palette exploration and selection process for main characters."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730591/Character_Model_Sheet_Colour_jefo2v.webp",
            title: "Character Model Sheet - Color",
            description: "Final colored character model sheets with turnarounds and expressions."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730593/CharacterStyle_jis3mj.webp",
            title: "Character Style Exploration",
            description: "Visual style development and character design refinement."
          }
        ]
      },
      {
        title: "Monster Development",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730644/MonstersOG_bcokm8.webp",
            title: "Monster Original Designs",
            description: "Initial concept art and design exploration for creature characters."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730640/MonsterDev_upxsh5.webp",
            title: "Monster Development",
            description: "Refined monster designs and character development process."
          }
        ]
      },
      {
        title: "Color Script & Storyboard",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730903/ColourScriptDraft1_lbjd9b.webp",
            title: "Color Script Draft",
            description: "Color timing and mood exploration for the animated sequence."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730899/0ab54785-7747-4db1-82b1-f1c4fe1ced7d-0002_t1tdma.webp",
            title: "Storyboard Frame 1",
            description: "Key story moments and shot composition planning."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730899/0ab54785-7747-4db1-82b1-f1c4fe1ced7d-0003_h3n7mc.webp",
            title: "Storyboard Frame 2",
            description: "Sequence development and visual storytelling progression."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730899/0ab54785-7747-4db1-82b1-f1c4fe1ced7d-0004_iejn19.webp",
            title: "Storyboard Frame 3",
            description: "Action sequences and character interaction moments."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730900/0ab54785-7747-4db1-82b1-f1c4fe1ced7d-0005_yjy4d2.webp",
            title: "Storyboard Frame 4",
            description: "Climactic moments and visual narrative conclusion."
          }
        ]
      },
      {
        title: "Poster Designs",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730338/TagPoster1_syu1ko.jpg",
            title: "Tag Poster Design",
            description: "Main promotional poster design featuring key characters and visual branding."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1750730337/TagPoster_Cinema_hpt8tv.jpg",
            title: "Cinema Poster",
            description: "Cinema-formatted poster design optimized for theatrical display."
          }
        ]
      }
    ]
  };

  const truckmateCampaign: Campaign = {
    id: "Truckmate",
    title: "Truckmate",
    sections: [
      {
        title: "Main Explainer Video",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/video/upload/v1751419934/Jakob_Backhouse_BMDR16_Explainer-Video_a3jrt3.webm",
            title: "Truckmate Explainer Video",
            description: "Complete animated explainer video showcasing the Truckmate platform and its key features."
          }
        ]
      },
      {
        title: "Storyboard & Animatic",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/video/upload/v1751412771/jakob_backhouse_bmdr16_animatic_lrq1si.mp4",
            title: "Project Animatic",
            description: "Storyboard animatic showing the narrative flow and timing for the explainer video."
          }
        ]
      },
      {
        title: "Logo Animation",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/video/upload/v1751419927/Jakob_Backhouse_BMDR16_Animated-Logo_f0lwxg.webm",
            title: "Animated Logo",
            description: "Dynamic logo animation created for the Truckmate brand identity."
          }
        ]
      },
      {
        title: "Promotional Materials",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751419299/Jakob_Backhouse_BMDR16_Promo-Poster2-02_zm4inm.jpg",
            title: "Promotional Poster",
            description: "Marketing poster design promoting the Truckmate platform and services."
          }
        ]
      }
    ]
  };

  const mysafetyTVCampaign: Campaign = {
    id: "MySafetyTV",
    title: "MySafetyTV",
    sections: [
      {
        title: "Main Training Video",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/video/upload/v1751424294/restraining_loads_pt1_1080p_vfoste.webm",
            title: "Restraining Loads - Part 1",
            description: "Safety training video focusing on proper load restraining techniques and best practices."
          }
        ]
      },
      {
        title: "Storyboard Development",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751498588/Storyboard_MySafetyTV_xkokxt.webp",
            title: "MySafetyTV Storyboard",
            description: "Comprehensive storyboard outlining the visual narrative and educational sequence for the safety training content."
          },
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751498588/Storyboard_MySafetyTV_1_gerzlh.webp",
            title: "MySafetyTV Storyboard Panel 2",
            description: "Continuation of the storyboard showcasing the next sequence in the safety training content."
          }
        ]
      },
      {
        title: "Safety Education Content",
        content: [
          {
            image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751498588/HVO_Distractions_bblswu.webp",
            title: "HVO Distractions",
            description: "Educational material focusing on distraction awareness and prevention strategies for heavy vehicle operators."
          }
        ]
      }
    ]
  };

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

// Enhanced BlurImage with progressive loading
const ProgressiveBlurImage = ({ 
  src, 
  alt, 
  className, 
  onClick, 
  onVisible, 
  isPriority = false,
  isPreloaded = false,
  ...props 
}: {
  src: string
  alt: string
  className?: string
  onClick?: () => void
  onVisible?: (src: string) => void
  isPriority?: boolean
  isPreloaded?: boolean
  [key: string]: any
}) => {
  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  const { ref, isInView } = useScrollInView({
    threshold: isMobile ? 0.05 : 0.1,
    triggerOnce: true,
    rootMargin: isMobile ? '100px' : '50px'
  });

  useEffect(() => {
    if (isInView && onVisible) {
      onVisible(src)
    }
  }, [isInView, src, onVisible])

  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center">
      <BlurImage
        src={src}
        alt={alt}
        width={isMobile ? 1280 : 2560}
        height={isMobile ? 720 : 1440}
        quality={isMobile ? 75 : 100}
        priority={isPriority || isPreloaded || isMobile}
        className={className}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 85vw, 80vw"
        unoptimized={true}
        onClick={onClick}
        {...props}
      />
    </div>
  )
}

// Enhanced PDF component
const AnimatedPDF = ({ pdfUrl, title }: { pdfUrl: string; title: string }) => {
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const [isPDFLoading, setIsPDFLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const mobileParams = "#view=FitH&toolbar=0&statusbar=0&messages=0&navpanes=0";
  const desktopParams = "#view=FitH&toolbar=0&navpanes=0&scrollbar=1";
  
  const pdfUrlWithParams = `${pdfUrl}${typeof window !== 'undefined' && window.innerWidth < 768 
    ? mobileParams 
    : desktopParams}`;

  useEffect(() => {
    setIsPDFLoading(true);
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
      <div className="relative bg-[#F9F9F9] dark:bg-[#222222] w-full h-full rounded-lg overflow-hidden">
        {isPDFLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        <iframe
          src={pdfUrlWithParams}
          className="w-full h-full"
          style={{ 
            height: '100%',
            minHeight: typeof window !== 'undefined' && window.innerWidth >= 768 
              ? 'calc(75vh - 20px)' 
              : 'calc(60vh - 20px)',
            border: 'none',
            background: '#F9F9F9',
          }}
          title={`${title} presentation`}
          frameBorder="0"
          onLoad={() => setIsPDFLoading(false)}
          allow="fullscreen"
        />
      </div>
    </div>
  );
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
  // State management - simplified but with all needed features
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null)
  const [activePDF, setActivePDF] = useState<{title: string, description: string} | null>(null)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const overlayClickable = useRef(false);

  // Set up intersection observer to track which image is in view
  useEffect(() => {
    if (!contentRef.current) return;

    const options = {
      root: contentRef.current,
      threshold: 0.6, // Image needs to be 60% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imageInfo = JSON.parse(entry.target.getAttribute('data-image-info') || '{}');
          setActiveItem({
            image: imageInfo.image || '',
            title: imageInfo.title || '',
            description: imageInfo.description || ''
          });
        }
      });
    }, options);

    // Observe all image containers
    imageRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Adjust overlay position to account for body top offset when scroll is locked
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const overlayEl = overlayRef.current;

    if (!overlayEl) return;

    // Store original transform so we can restore it later
    const originalTransform = overlayEl.style.transform;

    // Compensate for the negative body top shift
    overlayEl.style.transform = `translateY(${scrollY}px)`;

    return () => {
      // Restore original transform (default was 'none')
      overlayEl.style.transform = originalTransform || "none";
    };
  }, [isOpen]);

  // Early return - keep it simple and working
  if (!isOpen) {
    return null;
  }

  console.log('ProjectModal render:', { isOpen, projectId, title });

  // Enhanced scroll prevention that keeps background visible
  useEffect(() => {
    if (isOpen) {
      // Store original values
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      const scrollY = window.scrollY;

      // Prevent scrolling while keeping background visible
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // For mobile devices, also fix the body position to prevent scroll
      if (isTouchDevice) {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
      }

      // Prevent touch scrolling on the modal overlay
      const preventTouchScroll = (e: TouchEvent) => {
        // Allow scrolling within the modal content, but prevent on the overlay
        if (e.target === overlayRef.current) {
          e.preventDefault();
        }
      };

      // Add touch event listeners with passive: false to ensure preventDefault works
      document.addEventListener('touchstart', preventTouchScroll, { passive: false });
      document.addEventListener('touchmove', preventTouchScroll, { passive: false });

      return () => {
        // Restore original overflow
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        
        // Restore original body styles and scroll position
        if (isTouchDevice) {
          document.body.style.position = originalBodyPosition;
          document.body.style.top = originalBodyTop;
          document.body.style.width = originalBodyWidth;
          window.scrollTo(0, scrollY);
        }

        // Remove touch event listeners
        document.removeEventListener('touchstart', preventTouchScroll);
        document.removeEventListener('touchmove', preventTouchScroll);
      };
    }
  }, [isOpen, isTouchDevice]);

  // Device detection
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    
    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)
    
    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowRight':
          if (hasNext) onNext()
          break
        case 'ArrowLeft':
          if (hasPrevious) onPrevious()
          break
        case 'ArrowDown':
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: 300, behavior: 'smooth' });
          }
          break
        case 'ArrowUp':
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: -300, behavior: 'smooth' });
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, hasNext, hasPrevious])

  const handleClose = () => {
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      overlayClickable.current = false;
      const timer = setTimeout(() => {
        overlayClickable.current = true;
      }, 250); // 250ms delay before allowing overlay to close
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Prevent immediate close right after opening (especially on mobile)
    if (!overlayClickable.current) {
      return;
    }

    // Close if clicking on overlay, content area when not on image/controls, or any blank space
    if (
      e.target === overlayRef.current || 
      (e.target as HTMLElement)?.closest('[data-clickable-area="close"]')
    ) {
      handleClose();
    }
  }

  // Prevent touch scrolling on overlay
  const handleTouchMove = (e: React.TouchEvent) => {
    // Only prevent if touching the overlay itself, not content within
    if (e.target === overlayRef.current) {
      e.preventDefault()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only prevent if touching the overlay itself, not content within
    if (e.target === overlayRef.current) {
      e.preventDefault()
    }
  }

  const handleImageClick = (imageSrc: string) => {
    setEnlargedImage(imageSrc)
  }

  // Track scroll position
  const handleScroll = useCallback((e: any) => {
    const target = e.target
    const scrollPercent = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100
    setScrollProgress(Math.min(scrollPercent, 100))
    
    if (!hasScrolled && target.scrollTop > 0) {
      setHasScrolled(true)
    }
  }, [hasScrolled])

    const renderContentSection = (section: ContentSection) => {
      return (
        <div className="space-y-0">
          {section.content.map((item, i) => (
            <div 
              key={i} 
              className="w-full min-h-[80vh] flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start py-4 md:py-4 pl-4 pr-8 md:pl-10 md:pr-6"
              data-image-info={JSON.stringify(item)}
              ref={el => {
                if (el) imageRefs.current.set(item.image, el);
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-full md:w-full flex items-center md:items-start justify-center md:justify-start h-full">
                  {item.image.includes('player.vimeo.com') ? (
                    <div className="w-full md:w-[90%] mx-auto flex items-center justify-center h-full">
                      <div className="w-full max-w-4xl mx-auto relative" style={{paddingTop: '56.25%'}}>
                        <iframe
                          src={`${item.image}&loop=1`}
                          className="absolute top-0 left-0 w-full h-full rounded-sm border border-white/10"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                          title={item.title}
                        />
                      </div>
                    </div>
                  ) : (item.image.endsWith('.mp4') || item.image.endsWith('.webm') || item.image.endsWith('.mov')) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-full max-w-5xl mx-auto relative">
                        <video
                          controls
                          autoPlay
                          loop
                          muted
                          className="w-full h-auto max-h-[65vh] object-contain"
                          playsInline
                          preload="metadata"
                        >
                          {/* WebM source for modern browsers */}
                          {item.image.endsWith('.webm') && (
                            <>
                              <source src={item.image} type="video/webm" />
                              {/* Fallback MP4 for Safari and other browsers */}
                              <source 
                                src={item.image.replace('_a3jrt3.webm', '_e1z8mi.mp4').replace('_f0lwxg.webm', '_idvvx4.mov')} 
                                type={item.image.includes('Logo') ? "video/quicktime" : "video/mp4"} 
                              />
                            </>
                          )}
                          {/* Direct MP4/MOV sources */}
                          {(item.image.endsWith('.mp4') || item.image.endsWith('.mov')) && (
                            <source src={item.image} type={item.image.endsWith('.mov') ? "video/quicktime" : "video/mp4"} />
                          )}
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  ) : (
                    <ProgressiveBlurImage
                      src={item.image}
                      alt={item.title}
                    className="w-auto max-w-full max-h-[65vh] object-contain cursor-zoom-in"
                      onClick={() => handleImageClick(item.image)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
  };

  const renderPDFSection = (pdfUrl: string, title: string, parentTitle?: string) => (
    <div 
      className={`w-full ${!isTouchDevice ? 'snap-start' : ''} flex flex-col items-stretch justify-center py-0 md:py-6 m-0 md:px-14 h-[80vh]`}
      data-type="pdf-container" 
      data-pdf-title={title}
      data-parent-title={parentTitle || title}
    >
      <div className="w-full flex-1 h-full md:w-[95%] md:mx-auto">
        <AnimatedPDF pdfUrl={pdfUrl} title={title} />
      </div>
    </div>
  );

  const renderContent = () => {
    if (projectId === 'Creative Advertising') {
    return (
      <div className="space-y-0">
        {talesFromTheSunCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              renderContentSection(section)
            ) : (
              renderPDFSection(section.pdfUrl, section.title, talesFromTheSunCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else if (projectId === 'BumbleGanttWithTheWind') {
    return (
      <div className="space-y-0">
        {bumbleGanttCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              renderContentSection(section)
            ) : (
              renderPDFSection(section.pdfUrl, section.title, bumbleGanttCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else if (projectId === 'CreativeCoding') {
    return (
      <div className="space-y-0">
        {creativeCodingCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              renderContentSection(section)
            ) : (
              renderPDFSection(section.pdfUrl, section.title, creativeCodingCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else if (projectId === 'SmokeAnimation') {
    return (
      <div className="space-y-0">
        {smokeAnimationCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              renderContentSection(section)
            ) : (
              renderPDFSection(section.pdfUrl, section.title, smokeAnimationCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else if (projectId === 'Illustrations') {
    return (
      <div className="space-y-0">
        {illustrationCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
                renderContentSection(section)
              ) : (
              renderPDFSection(section.pdfUrl, section.title, illustrationCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else if (projectId === 'Tag') {
    return (
      <div className="space-y-0">
        {tagCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              renderContentSection(section)
            ) : (
              renderPDFSection(section.pdfUrl, section.title, tagCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else if (projectId === 'Truckmate') {
    return (
      <div className="space-y-0">
        {truckmateCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              renderContentSection(section)
            ) : (
              renderPDFSection(section.pdfUrl, section.title, truckmateCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else if (projectId === 'MySafetyTV') {
    return (
      <div className="space-y-0">
        {mysafetyTVCampaign.sections.map((section, idx) => (
          <div key={idx}>
            {'content' in section ? (
              renderContentSection(section)
            ) : (
              renderPDFSection(section.pdfUrl, section.title, mysafetyTVCampaign.title)
            )}
          </div>
        ))}
      </div>
    );
    } else {
      // For projects with just a single image
      return (
    <div 
      className={`w-full ${!isTouchDevice ? 'snap-start' : ''} flex items-center justify-center py-10 md:py-16 px-4 md:px-14`}
      data-image-info={JSON.stringify({ 
        image: image, 
        title: "", 
        description: "" 
      })}
    >
      <div className="w-full md:w-[90%] mx-auto flex items-center justify-center">
        <ProgressiveBlurImage
          src={image}
          alt={title}
            className="w-auto max-w-full max-h-[60vh] md:max-h-[65vh] object-contain cursor-zoom-in"
          onClick={() => handleImageClick(image)}
          isPriority={true}
        />
      </div>
    </div>
  );
    }
  }

  const modal = (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-[9999] overflow-hidden ${
        isTouchDevice 
          ? 'bg-black' // Opaque background for mobile/touch devices
          : 'bg-black/50 backdrop-blur-md' // Semi-transparent with blur for desktop
      }`}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        // Only apply backdrop filters on non-touch devices for performance
        backdropFilter: isTouchDevice ? 'none' : 'blur(8px) saturate(180%)',
        WebkitBackdropFilter: isTouchDevice ? 'none' : 'blur(8px) saturate(180%)',
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        transform: 'none',
        touchAction: 'none' // Additional touch prevention
      }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-[10000]">
        <div 
          className="h-full bg-white transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Close button - hidden when image viewer is open */}
      {!enlargedImage && (
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-[10000] p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Navigation buttons */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
        <button 
          onClick={onPrevious}
          className={`pointer-events-auto p-4 md:p-5 rounded-full transform transition-all ${hasPrevious ? 'opacity-80 hover:opacity-100 hover:scale-110 translate-x-0' : 'opacity-40 cursor-not-allowed -translate-x-full'}`}
          disabled={!hasPrevious}
          aria-label="Previous project"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
        
        <button 
          onClick={onNext}
          className={`pointer-events-auto p-4 md:p-5 rounded-full transform transition-all ${hasNext ? 'opacity-80 hover:opacity-100 hover:scale-110 translate-x-0' : 'opacity-40 cursor-not-allowed translate-x-full'}`}
          disabled={!hasNext}
          aria-label="Next project"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      </div>



      {/* Modal content - constrained to viewport */}
      <div className="flex flex-col md:flex-row w-full h-full px-3 pt-8 md:pt-0 pb-8 md:gap-2 lg:gap-3 justify-start max-w-full max-h-full overflow-hidden">
        {/* Title and description for mobile */}
        <div className="md:hidden w-full py-4">
          <div className="text-left">
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/80 mb-2">{description}</p>
          </div>
        </div>

                {/* Content area */}
        <div 
          ref={contentRef}
          data-clickable-area="close"
          onScroll={handleScroll}
          className="w-full md:w-[60%] lg:w-[62%] flex-1 overflow-y-auto relative md:pr-4 lg:pr-6 max-w-full max-h-full"
          onClick={(e) => {
            // Don't close if clicking on images, videos, or interactive elements
            const target = e.target as HTMLElement;
            if (
              target.tagName === 'IMG' ||
              target.tagName === 'VIDEO' ||
              target.tagName === 'IFRAME' ||
              target.closest('img') ||
              target.closest('video') ||
              target.closest('iframe')
            ) {
              e.stopPropagation();
            }
          }}
        >
          <div className="w-full">
              {renderContent()}
            </div>
        </div>

        {/* Title and description sidebar - desktop only (enhanced) */}
        <div className="hidden md:block md:w-[35%] lg:w-[32%] xl:w-[30%] md:pl-6 lg:pl-8 xl:pl-10 md:pr-14 lg:pr-20 xl:pr-24 flex-none flex flex-col overflow-y-auto mt-14 lg:mt-16 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4 max-w-full max-h-full">
          <div className="text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">{title}</h2>
            <p className="text-base text-white/90 mb-6 leading-relaxed">{description}</p>
            
            {/* Current image information */}
            <div className="mt-4 border-t border-white/10 pt-4 min-h-[100px] relative">
              {activeItem && activeItem.title && activeItem.title !== projectId && (
                <div className="transition-all duration-200 ease-out">
                  <h3 className="font-mono text-lg font-bold text-white mb-1 leading-tight">{activeItem.title}</h3>
                  {activeItem.description && (
                    <p className="text-sm text-white/80 leading-normal">{activeItem.description}</p>
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

  // Render modal via React portal so it overlays entire viewport regardless of scroll context
  return typeof window !== 'undefined' ? createPortal(modal, document.body) : null
}