"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import ImageViewer from "./ImageViewer";
import { useScrollInView } from "../../hooks/useScrollInView";
import OrangeLoadingCube from "../common/OrangeLoadingCube";
import BlurImage from "../BlurImage";
import { getCDNUrl } from "../../utils/cdn";
import { createPortal } from "react-dom";
import type { Project } from "../../types/project";
import { useAutoImageTracking } from "../../hooks/useAutoMemoryManagement";
import MemoryStatsDebugger from "../common/MemoryStatsDebugger";

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
// Optimize descriptions to be shorter for better memory usage

const talesFromTheSunCampaign: Campaign = {
  id: "tales-from-sun",
  title: "Tales from the Sun",
  sections: [
    {
      title: "Storyboard",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TalesFromTheSun/Storyboard_TalesFromTheSun.webp",
          title: "Tales from the Sun Storyboard",
          description:
            "A horror-inspired video ad for sun safety targeting young males. Uses 80s 'Tales From the Crypt' and 2000s scary movie aesthetics.",
        },
      ],
    },
    {
      title: "Campaign Strategy",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TalesFromTheSun/TheIssueTalesFromTheSun.webp",
          title: "The Issue",
          description:
            "Young males in NZ have a 'she'll be right' attitude about sun protection despite high UV levels.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TalesFromTheSun/InsightTalesFromTheSun.webp",
          title: "Campaign Insight",
          description:
            "Young males care about being attractive to the opposite gender. The campaign links sun damage to being undesirable.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TalesFromTheSun/SingleMindedMessageTalesFromTheSun.webp",
          title: "Single Minded Message",
          description: "Don't be a crayfish, wear sunblock.",
        },
      ],
    },
  ],
};

const bumbleGanttCampaign: Campaign = {
  id: "bumble-gantt",
  title: "Bumble ICK Campaign",
  sections: [
    {
      title: "Storyboards",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/Storyboard_BumbleICK%20(2).webp",
          title: "BumbleICK Storyboard",
          description:
            "A mock Bumble collaboration addressing Gen Z's use of 'ICKs' as excuses for human imperfections. Promotes Bumble as an open, safe platform for vulnerability.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/GenZDevelopsICKSSlide.webp",
          title: "Insight",
          description:
            "Gen Z develops ICKs as excuses for human imperfections. The campaign promotes Bumble as a safe space for vulnerability.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/KickTheIckSlide.webp",
          title: "ICK Billboard",
          description:
            "Provocative billboard design for the BumbleGantt campaign targeting a Gen Z audience.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/CatchingIcksIsBadForYou.webp",
          title: "Single Minded Message",
          description:
            "Catching an ICK is bad for you. Promotes a compassionate, inclusive dating culture.",
        },
      ],
    },
  ],
};

const creativeCodingCampaign: Campaign = {
  id: "CreativeCoding",
  title: "Creative Coding",
  sections: [
    {
      title: "Project Overview",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_3.webp",
          title: "Example Photo 1",
          description:
            "Photo manipulated with p5.js to create a pixelated, painterly effect evoking childhood walks. Based in Central Park, Wellington, NZ.",
        },
      ],
    },
    {
      title: "Concept Development",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_1.webp",
          title: "Example Photo 2",
          description:
            "Photo manipulated with p5.js to create a pixelated, painterly effect evoking childhood walks. Based in Central Park, Wellington, NZ.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_2.webp",
          title: "Example Photo 3",
          description:
            "Photo manipulated with p5.js to create a pixelated, painterly effect evoking childhood walks. Based in Central Park, Wellington, NZ.",
        },
      ],
    },
  ],
};

const smokeAnimationCampaign: Campaign = {
  id: "SmokeAnimation",
  title: "Smoke Animation",
  sections: [
    {
      title: "Final Animation",
      content: [
        {
          image: "vimeo:913926901",
          title: "Smoke Animation",
          description: "The full short film.",
        },
        {
          image: "vimeo:1104662949",
          title: "Smoke Animatic",
          description:
            "The animatic was similar to the final animation, but some scenes were cut due to time constraints. The first establishing shot of the city is one I would like to add in. Although the suffocating effect of always being in the train works for the film in conveying the inescapable feeling of addiction.",
        },
      ],
    },
    {
      title: "Storyboard",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard.webp",
          title: "Storyboard Panel 1",
          description:
            "Establishes the train setting and mood. The bear appears as a transcendent character when light passes.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard1.webp",
          title: "Storyboard Panel 2",
          description:
            "The character gets increasingly annoyed with train noises. The bear irritates him further.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard2.webp",
          title: "Storyboard Panel 3",
          description:
            "People pile into the train as it enters a tunnel. The character reaches his darkest moment.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard3.webp",
          title: "Storyboard Panel 4",
          description:
            "The character, bewildered, goes for a smoke. The train leaves the tunnel, revealing a great view.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard4.webp",
          title: "Storyboard Panel 5",
          description:
            "The character is confused but accepting and happy for the first time in a long while. He is snapped out of his daze by 'Alright'—he arrives at his destination.",
        },
      ],
    },
    {
      title: "Character Sheets",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/CharacterLookDevelopment.webp",
          title: "Character Look Development",
          description:
            "Reference drawings for character expressions. Since the film revolves around the character's face, I thought it was important to get some solid references.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/BearAndCharacterSketches.webp",
          title: "Bear and Character Sketches",
          description:
            "Preparatory sketches exploring different looks. I chose the simplest designs for easy animation.",
        },
      ],
    },
    {
      title: "Experimental Animation",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/BackhouseJakob_ANFX301_Project3.webm",
          title: "Animation Experiments",
          description:
            "Proof of concept experiment. The first 2D animation I've ever done.",
        },
      ],
    },
  ],
};

const illustrationCampaign: Campaign = {
  id: "Illustrations",
  title: "Illustrations & Paintings",
  sections: [
    {
      title: "Landscapes & Environments",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/HighaltitudeLandScape(compressed).webp",
          title: "High Altitude Landscape",
          description:
            "Personal digital painting done in Photoshop. I was inspired by a walk I went on a long time ago in Mangawhero Forest. I loved the extreme colours and the sparkling, magical feeling everything had.",
        },
        {
          image: getCDNUrl(
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/SaddleRoadQuickSketch.webp"
          ),
          title: "Saddle Road Quick Study",
          description:
            "Personal digital painting done in Photoshop. A quick study based on a photo my mum took on Saddle Road.",
        },
        {
          image: getCDNUrl(
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/New_Series.webp"
          ),
          title: "Wellington Rooftop",
          description:
            "Personal digital painting done in Procreate. First in a series exploring light and shadow based on Wellington and other city tropes and characters taken from the animated film Akira.",
        },
      ],
    },
    {
      title: "Dynamic Scenes & Character Studies",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/Run(compressed).webp",
          title: "Run",
          description:
            "Personal digital painting created in Photoshop, based on a photo taken in the forest next to the Mount Victoria lookout in Wellington.",
        },
        {
          image: getCDNUrl(
            "https:/media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/BrightLights.webp"
          ),
          title: "Bright Lights",
          description:
            "Personal digital painting created in Procreate, based on a personal experience I had climbing around abandoned buildings in Wellington.",
        },
        {
          image: getCDNUrl(
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/photobash.webp"
          ),
          title: "Photobash",
          description:
            "Mixed media digital artwork combining photography and painting. It was primarily an exercise to learn how to photobash in Photoshop, but I created a narrative of aliens invading a city and warping time, as they are interdimensional aliens.",
        },
      ],
    },
    {
      title: "Experimental Works",
      content: [
        {
          image: getCDNUrl(
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/11.webp"
          ),
          title: "Abstract Alien World Painting",
          description:
            "This is a digital painting created on top of a Blender model. I honestly can't remember what the concept behind this painting was.",
        },
      ],
    },
  ],
};

const tagCampaign: Campaign = {
  id: "Tag",
  title: "Tag",
  sections: [
    {
      title: "Main Trailer",
      content: [
        {
          image: "vimeo:1093033927",
          title: "Tag Trailer",
          description:
            "Trailer for Tag to promote the short film to potential collaborators and film festivals. It is a scene directly from the short film, so it could also be used as a proof of concept.",
        },
        {
          image: "vimeo:1104662194",
          title: "Tag Full Short Film Animatic",
          description:
            "I began storyboarding this concept years ago in collaboration with Michelle Pretorious. We each developed storyboards intending to animate whichever we preferred together. Though our collaboration ended due to time constraints, I chose to develop my early storyboard individually. What started as a personally interesting animation revealed deeper meaning through reflective practices: documenting my thoughts through writing, getting feedback from peers, friends, and lecturers through the animatic, character development, and a poem.",
        },
      ],
    },
    {
      title: "Backgrounds",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background0.5.webp",
          title: "Background 1",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background1.webp",
          title: "Background 2",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background2.webp",
          title: "Background 3",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background3.webp",
          title: "Background 4",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background5.webp",
          title: "Background 5",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background5.5.webp",
          title: "Background 6",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background5.75.webp",
          title: "Background 7",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background6.webp",
          title: "Background 8",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background7.webp",
          title: "Background 9",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/OriginalFence%20Background.webp",
          title: "Alternative Background Style",
          description:
            "During the process of creating these backgrounds, I experimented with many different styles. This style was too detailed and realistic. I like my new backgrounds because they are more expressive of the character's inner world.",
        },
      ],
    },
    {
      title: "Character Development",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/Character_Model_Sheet_Sketches.webp",
          title: "Initial Character Model Sheet Sketches",
          description:
            "When developing my character, I initially thought about creating them out of simple shapes so they could be easily manipulated in 3D. I also knew that since the short film revolved around the character's expressions, the face would have to be able to show this.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/CharacterColourPicking.webp",
          title: "Character Color Picking",
          description:
            "While figuring out what colour I wanted my character to be, I wanted them to feel relatable so the audience could see themselves in them.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/Character_Model_Sheet_Colour.webp",
          title: "Character Model Sheet - Color",
          description:
            "Later, the colour of my character changed from this. It had too much of a Simpsons feeling to it with the yellow. It gave the character a naive, happy-go-lucky feeling that did not fit the story.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/CharacterStyle.webp",
          title: "Character Style Exploration",
          description:
            "Visual style development and character design refinement.",
        },
      ],
    },
    {
      title: "Monster Development",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/MonstersOG.webp",
          title: "Monster Initial Sketches",
          description:
            "These monsters were inspired by child-like depictions of monsters because they are intended to look like they came from a child's imagination. As with the backgrounds, I used a digital crayon brush to create them.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/MonsterConcepts.webp",
          title: "Monster Development Sketches",
          description:
            "For these monster developments, I was thinking about how I could show them moving around my scene three-dimensionally. So I modified my original drawings by constructing them around basic shapes. Although I felt like some of the original personality was lost in these, for the final monsters shown in the scene, the monsters were modified a bit further.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/MonsterDev.webp",
          title: "Monster Development",
          description:
            "For these monster developments, I was thinking about how I could show them moving around my scene three-dimensionally. So I modified my original drawings by constructing them around basic shapes. Although I felt like some of the original personality was lost in these, for the final monsters shown in the scene, the monsters were modified a bit further.",
        },
      ],
    },
    {
      title: "Color Script & Storyboard",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/ColourScriptDraft1.webp",
          title: "Color Script Draft",
          description:
            "Creating a colour script was a really helpful exercise in breaking me away from realistic colours. While creating this, I focused only on how the colours made me feel and whether this was right for the story.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard1.png",
          title: "Storyboard Frame 1",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard2.png",
          title: "Storyboard Frame 2",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard3.png",
          title: "Storyboard Frame 3",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard4.png",
          title: "Storyboard Frame 4",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard5.png",
          title: "Storyboard Frame 5",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard6.png",
          title: "Storyboard Frame 6",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard7.png",
          title: "Storyboard Frame 7",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard7.5.png",
          title: "Storyboard Frame 8",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard8.png",
          title: "Storyboard Frame 9",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard9.png",
          title: "Storyboard Frame 10",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.",
        },
      ],
    },
    {
      title: "Poster Designs",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/TrailerCollateral/TagPoster_Cinema.webp",
          title: "Mock-up Cinema Poster",
          description:
            "A mock-up of what the poster would look like if it was printed as a cinema poster in Light House Cinemas, Wellington, on Cuba Street.",
        },
      ],
    },
    {
      title: "Backhouse Studios",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/TrailerCollateral/BackhouseStudios.webp",
          title: "Backhouse Studios",
          description:
            "A studio logo design that I created for my own studio. I wanted it to feel authentic to myself.",
        },
      ],
    },
  ],
};

const truckmateCampaign: Campaign = {
  id: "Truckmate",
  title: "Truckmate",
  sections: [
    {
      title: "Main Explainer Video",
      content: [
        {
          image: "vimeo:1105289689",
          title: "Truckmate Explainer Video",
          description:
            "The final explainer video for Truckmate. Primarily shown on YouTube but also designed for other social media platforms.",
        },
      ],
    },
    {
      title: "Storyboard & Animatic",
      content: [
        {
          image: "vimeo:1104663506",
          title: "Project Animatic",
          description:
            "Storyboard animatic showing the narrative flow and timing for the explainer video. During the creation of this, I focused on the key message I wanted to communicate and how to do this efficiently in 30 seconds.",
        },
      ],
    },
    {
      title: "Logo Animation",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TruckMate/Jakob_Backhouse_BMDR16_Animated-Logo.webm",
          title: "Animated Logo",
          description:
            "Dynamic logo animation created for the Truckmate brand identity. To be shown at the end of video ads. Potentially even as a moving logo on a website.",
        },
      ],
    },
    {
      title: "Promotional Materials",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TruckMate/Jakob_Backhouse_BMD1R6_Mockup.webp",
          title: "Promotional Poster",
          description:
            "The idea behind this poster was that it would strike a chord with truckers when they are out late at night and don't know where they are going because their app doesn't give them truck-specific information.",
        },
      ],
    },
  ],
};

const mysafetyTVCampaign: Campaign = {
  id: "MySafetyTV",
  title: "MySafetyTV",
  sections: [
    {
      title: "Main Training Video",
      content: [
        {
          image: "vimeo:855235415",
          title: "Heavy Vehicle Restraining Loads",
          description:
            "Safety training video focusing on proper heavy vehicle load restraining techniques and best practices. Created in After Effects and Blender, combining 2D and 3D animation.",
        },
      ],
    },
    {
      title: "Main Training Video",
      content: [
        {
          image: "vimeo:1105289544",
          title: "Heavy Vehicle Distractions",
          description:
            "Safety training video focusing on the dangers of distractions for heavy vehicle operators. Created in After Effects and Blender, combining 2D and 3D animation.",
        },
      ],
    },
    {
      title: "Main Training Video",
      content: [
        {
          image: "vimeo:1105289367",
          title: "Heavy Vehicle Speeding",
          description:
            "Safety training video focusing on the dangers of speeding for heavy vehicle operators. Created in After Effects and Blender, combining 2D and 3D animation.",
        },
      ],
    },
    {
      title: "Storyboard Development",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/MySafetyTV/Storyboard_MySafetyTV.webp",
          title: "MySafetyTV Storyboard",
          description:
            "Storyboard development for a promotional video to be used on the MySafetyTV website. Created in Procreate.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/MySafetyTV/Storyboard_MySafetyTV%201.webp",
          title: "MySafetyTV Storyboard Panel 2",
          description:
            "Storyboard development for a promotional video to be used on the MySafetyTV website. Created in Procreate.",
        },
      ],
    },
  ],
};

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  image: string;
  filteredProjects: Project[];
  selectedProject: string;
  setSelectedProject: (id: string) => void;
}

// Simplified image component using Next.js optimizations and built-in blur
const OptimizedImage = ({
  src,
  alt,
  className,
  onClick,
  isPriority = false,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  isPriority?: boolean;
  [key: string]: any;
}) => {
  return (
    <BlurImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      quality={85}
      priority={isPriority}
      className={`${className || ""} w-full h-[60vh] object-contain cursor-zoom-in mx-auto`}
      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 85vw, 80vw"
      onClick={onClick}
      {...props}
    />
  );
};

// New lazy video component with memory management support
const LazyVideo = ({
  src,
  title,
  className = "",
  autoPlay = true,
  controls = false,
  ...props
}: {
  src: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  [key: string]: any;
}) => {
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: false, // Changed to detect re-entry
    rootMargin: "100px",
  });

  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [videoKey, setVideoKey] = useState(0); // Force re-render when video needs reload
  const [wasLoaded, setWasLoaded] = useState(false); // Track if video was previously loaded

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setWasLoaded(false);
    setVideoKey((prev) => prev + 1);
    setShouldLoad(false);
  }, [src]);

  useEffect(() => {
    if (isInView && !shouldLoad) {
      setShouldLoad(true);
    }

    // Only reset video if it's been unloaded (more conservative approach)
    if (isInView && wasLoaded && !shouldLoad) {
      // Reset states to show loading indicator again, but only if shouldLoad was false
      setIsLoaded(false);
      setVideoKey((prev) => prev + 1);
      setShouldLoad(true);
    }
  }, [isInView, shouldLoad, wasLoaded]);

  // Subtle loading indicator component
  const SubtleLoader = () => (
    <>
      <style>
        {`
          @keyframes modalSpinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .modal-spinner {
            animation: modalSpinner 1s linear infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="modal-spinner w-8 h-8 border-2 border-white/20 border-t-white rounded-full"></div>
          <div className="text-white/70 text-xs font-light tracking-wide">
            Loading video...
          </div>
        </div>
      </div>
    </>
  );

  const ErrorFallback = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3 text-center px-4">
        <div className="w-8 h-8 border-2 border-red-400/50 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-red-400/70 rounded-full"></div>
        </div>
        <div className="text-white/70 text-xs font-light">
          Failed to load video
        </div>
        <button
          onClick={() => {
            setHasError(false);
            setIsLoaded(false);
            setWasLoaded(false);
            setVideoKey((prev) => prev + 1);
            setShouldLoad(true);
          }}
          className="text-white/50 text-xs underline hover:text-white/70 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className="w-full h-full flex items-center justify-center relative"
    >
      {shouldLoad ? (
        <div className="relative w-full h-full">
          <video
            key={videoKey} // Force re-render when video needs reload
            autoPlay={autoPlay}
            loop
            muted
            playsInline
            webkit-playsinline="true"
            controls={controls}
            disablePictureInPicture
            className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
            preload="metadata"
            onLoadedData={(e) => {
              const video = e.target as HTMLVideoElement;
              setIsLoaded(true);
              setWasLoaded(true);
              video.play().catch(() => {
                console.log("Autoplay prevented, will play on hover");
              });
            }}
            onCanPlay={() => {
              setIsLoaded(true);
              setWasLoaded(true);
            }}
            onError={() => {
              setIsLoaded(false);
              setHasError(true);
            }}
            onMouseEnter={(e) => {
              const video = e.target as HTMLVideoElement;
              video.play().catch(() => {});
            }}
            {...props}
          >
            {/* WebM source for modern browsers */}
            {src.endsWith(".webm") && (
              <>
                <source src={src} type="video/webm" />
                {/* Fallback MP4 for Safari and other browsers */}
                <source
                  src={src
                    .replace("_a3jrt3.webm", "_e1z8mi.mp4")
                    .replace("_f0lwxg.webm", "_idvvx4.mov")}
                  type={src.includes("Logo") ? "video/quicktime" : "video/mp4"}
                />
              </>
            )}
            {/* Direct MP4/MOV sources */}
            {(src.endsWith(".mp4") || src.endsWith(".mov")) && (
              <source
                src={src}
                type={src.endsWith(".mov") ? "video/quicktime" : "video/mp4"}
              />
            )}
            Your browser does not support the video tag.
          </video>
          {!isLoaded && !hasError && <SubtleLoader />}
          {hasError && <ErrorFallback />}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center relative">
          <SubtleLoader />
        </div>
      )}
    </div>
  );
};

// New lazy iframe component for Vimeo embeds with memory management support
const LazyVimeoEmbed = ({
  videoId,
  title,
  className = "",
}: {
  videoId: string;
  title: string;
  className?: string;
}) => {
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true, // Vimeo embeds don't need re-entry detection
    rootMargin: "100px",
  });

  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [embedKey, setEmbedKey] = useState(0); // Keep for retry functionality
  const [wasLoaded, setWasLoaded] = useState(false); // Keep for tracking

  // Reset states when videoId changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setWasLoaded(false);
    setEmbedKey((prev) => prev + 1);
    setShouldLoad(false);
  }, [videoId]);

  useEffect(() => {
    if (isInView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isInView, shouldLoad]);

  // Add timeout for iframe loading and automatic loading assumption
  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      // Assume loaded after reasonable time for better UX
      const loadingTimeout = setTimeout(() => {
        setIsLoaded(true);
      }, 3000); // 3 second timeout to assume loaded

      // Error timeout for much longer
      const errorTimeout = setTimeout(() => {
        if (!isLoaded) {
          setHasError(true);
        }
      }, 15000); // 15 second timeout for actual error

      return () => {
        clearTimeout(loadingTimeout);
        clearTimeout(errorTimeout);
      };
    }
  }, [shouldLoad, isLoaded]);

  // Clean the video ID to ensure it's numeric
  const cleanVideoId = videoId.replace(/[^0-9]/g, "");
  const vimeoUrl = `https://player.vimeo.com/video/${cleanVideoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1`;

  // Debug logging for development
  if (process.env.NODE_ENV === "development") {
    console.log("Vimeo embed details:", {
      originalVideoId: videoId,
      cleanVideoId,
      vimeoUrl,
    });
  }

  // Subtle loading indicator component
  const SubtleLoader = () => (
    <>
      <style>
        {`
          @keyframes vimeoSpinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .vimeo-spinner {
            animation: vimeoSpinner 1s linear infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="vimeo-spinner w-8 h-8 border-2 border-white/20 border-t-white rounded-full"></div>
          <div className="text-white/70 text-xs font-light tracking-wide">
            Loading video...
          </div>
        </div>
      </div>
    </>
  );

  const ErrorFallback = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3 text-center px-4">
        <div className="w-8 h-8 border-2 border-red-400/50 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-red-400/70 rounded-full"></div>
        </div>
        <div className="text-white/70 text-xs font-light">
          Failed to load video
        </div>
        <button
          onClick={() => {
            console.log("Retrying Vimeo embed:", cleanVideoId);
            setHasError(false);
            setIsLoaded(false);
            setWasLoaded(false);
            setEmbedKey((prev) => prev + 1);
            setShouldLoad(false);
            // Force re-render by toggling shouldLoad
            setTimeout(() => setShouldLoad(true), 100);
          }}
          className="text-white/50 text-xs underline hover:text-white/70 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className="w-full h-full flex items-center justify-center relative"
    >
      {shouldLoad ? (
        <div
          className="w-full h-full max-w-4xl mx-auto relative"
          style={{ aspectRatio: "16/9", maxHeight: "70vh" }}
        >
          <iframe
            key={embedKey} // Force re-render when embed needs reload
            src={vimeoUrl}
            className={`absolute top-0 left-0 w-full h-full rounded-sm border border-white/10 ${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            title={title}
            style={{ pointerEvents: "auto" }}
            loading="lazy"
            onLoad={() => {
              console.log("Vimeo iframe loaded:", cleanVideoId);
              setIsLoaded(true);
              setWasLoaded(true);
            }}
            onError={(e) => {
              console.error("Vimeo iframe error:", e, cleanVideoId);
              setHasError(true);
            }}
          />
          {!isLoaded && !hasError && <SubtleLoader />}
          {hasError && <ErrorFallback />}
        </div>
      ) : (
        <div
          className="w-full h-full max-w-4xl mx-auto flex items-center justify-center relative"
          style={{ aspectRatio: "16/9", maxHeight: "70vh" }}
        >
          <SubtleLoader />
        </div>
      )}
    </div>
  );
};

// Enhanced PDF component
const AnimatedPDF = ({ pdfUrl, title }: { pdfUrl: string; title: string }) => {
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: "50px", // Smaller margin for PDFs
  });
  const [isPDFLoading, setIsPDFLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isInView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isInView, shouldLoad]);

  const mobileParams = "#view=FitH&toolbar=0&statusbar=0&messages=0&navpanes=0";
  const desktopParams = "#view=FitH&toolbar=0&navpanes=0&scrollbar=1";

  const pdfUrlWithParams = `${pdfUrl}${
    typeof window !== "undefined" && window.innerWidth < 768
      ? mobileParams
      : desktopParams
  }`;

  useEffect(() => {
    if (shouldLoad) {
      setIsPDFLoading(true);
      const timer = setTimeout(() => {
        setIsPDFLoading(false);
      }, 3000);

      // Additional timeout for Safari PDF loading issues
      const errorTimer = setTimeout(() => {
        if (isPDFLoading) {
          setHasError(true);
          setIsPDFLoading(false);
        }
      }, 15000); // 15 second timeout for PDF loading

      return () => {
        clearTimeout(timer);
        clearTimeout(errorTimer);
      };
    }
  }, [shouldLoad, isPDFLoading]);

  // Subtle loading indicator component
  const SubtleLoader = () => (
    <>
      <style>
        {`
          @keyframes pdfSpinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .pdf-spinner {
            animation: pdfSpinner 1s linear infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="pdf-spinner w-8 h-8 border-2 border-white/20 border-t-white rounded-full"></div>
          <div className="text-white/70 text-xs font-light tracking-wide">
            Loading PDF...
          </div>
        </div>
      </div>
    </>
  );

  const ErrorFallback = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3 text-center px-4">
        <div className="w-8 h-8 border-2 border-red-400/50 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-red-400/70 rounded-full"></div>
        </div>
        <div className="text-white/70 text-xs font-light">
          Failed to load PDF
        </div>
        <button
          onClick={() => {
            setHasError(false);
            setIsPDFLoading(true);
            setShouldLoad(false);
            // Force re-render by toggling shouldLoad
            setTimeout(() => setShouldLoad(true), 100);
          }}
          className="text-white/50 text-xs underline hover:text-white/70 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-500 ease-out w-full h-full
        ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      data-type="pdf-container"
      style={{ background: "#F9F9F9", height: "100%" }}
    >
      <div className="relative bg-[#F9F9F9] dark:bg-[#222222] w-full h-full rounded-lg overflow-hidden">
        {(isPDFLoading || !shouldLoad || hasError) && (
          <div className="absolute inset-0 flex items-center justify-center">
            {hasError ? <ErrorFallback /> : <SubtleLoader />}
          </div>
        )}

        {shouldLoad && !hasError && (
          <iframe
            src={pdfUrlWithParams}
            className="w-full h-full"
            style={{
              height: "100%",
              minHeight:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? "calc(75vh - 20px)"
                  : "calc(60vh - 20px)",
              border: "none",
              background: "#F9F9F9",
            }}
            title={`${title} presentation`}
            frameBorder="0"
            onLoad={() => setIsPDFLoading(false)}
            onError={() => setHasError(true)}
            allow="fullscreen"
            loading="lazy"
          />
        )}
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
  filteredProjects,
  selectedProject,
  setSelectedProject,
}: ProjectModalProps) {
  // State management - simplified but with all needed features
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
  const [activePDF, setActivePDF] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });

  // MODIFICATION: Replaced single state with independent states for each text block
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showOverviewMore, setShowOverviewMore] = useState(false);
  const [showDetailsMore, setShowDetailsMore] = useState(false);

  const [mobileScrollY, setMobileScrollY] = useState(0);
  const [isModalSettled, setIsModalSettled] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const overlayClickable = useRef(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const isFirstOpenRef = useRef(true);

  // MODIFICATION: Refs for text paragraphs to check for overflow
  const overviewTextRef = useRef<HTMLParagraphElement>(null);
  const detailsTextRef = useRef<HTMLParagraphElement>(null);

  // MODIFICATION: Effect to check for text overflow on mobile
  useEffect(() => {
    // Only run this logic on touch devices where this UI is visible
    if (!isOpen || !isTouchDevice) return;

    // Reset expansion state when the selected project changes
    setIsOverviewExpanded(false);
    setIsDetailsExpanded(false);

    // Use a timeout to ensure the DOM has rendered and styles are applied
    const timer = setTimeout(() => {
      const overviewEl = overviewTextRef.current;
      if (overviewEl) {
        // Check if the content's full height is greater than its visible (clamped) height
        setShowOverviewMore(overviewEl.scrollHeight > overviewEl.clientHeight);
      } else {
        setShowOverviewMore(false);
      }

      const detailsEl = detailsTextRef.current;
      if (detailsEl) {
        setShowDetailsMore(detailsEl.scrollHeight > detailsEl.clientHeight);
      } else {
        setShowDetailsMore(false);
      }
    }, 150); // A small delay ensures accurate measurement

    return () => clearTimeout(timer);
  }, [isOpen, isTouchDevice, description, activeItem, selectedProject]);

  // Auto memory management for modal content
  const { trackAllElements, getStats: getModalTrackingStats } =
    useAutoImageTracking(modalContainerRef, {
      enabled: isOpen,
      debugLog: process.env.NODE_ENV === "development",
      selector: "img, video, iframe",
      trackOnMount: true,
      retryInterval: 1500, // Check for new elements more frequently in modals
    });

  // Navigation logic (now internal)
  const currentProjectIndex = selectedProject
    ? filteredProjects.findIndex((p) => p.id === selectedProject)
    : -1;
  const hasNext = currentProjectIndex < filteredProjects.length - 1;
  const hasPrevious = currentProjectIndex > 0;
  const onNext = () => {
    if (hasNext)
      setSelectedProject(filteredProjects[currentProjectIndex + 1].id);
  };
  const onPrevious = () => {
    if (hasPrevious)
      setSelectedProject(filteredProjects[currentProjectIndex - 1].id);
  };

  // Set up intersection observer to track which image is in view
  useEffect(() => {
    if (!contentRef.current) return;

    const options = {
      root: contentRef.current,
      threshold: 0.6, // Image needs to be 60% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imageInfo = JSON.parse(
            entry.target.getAttribute("data-image-info") || "{}"
          );
          setActiveItem({
            image: imageInfo.image || "",
            title: imageInfo.title || "",
            description: imageInfo.description || "",
          });
        }
      });
    }, options);

    // Observe all image containers
    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // FIX: Improved modal positioning to fix wrong spots and positioning issues
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const overlayEl = overlayRef.current;

    if (!overlayEl) return;

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Setting modal position - scrollY:",
        scrollY,
        "isTouchDevice:",
        isTouchDevice,
        "isFirstOpen:",
        isFirstOpenRef.current
      );
    }

    // Store original transform so we can restore it later
    const originalTransform = overlayEl.style.transform;

    // FIX: Apply positioning for both touch and non-touch devices, but differently
    if (isTouchDevice) {
      // FIX: For mobile, only apply translateY on initial open and reset positioning on project change
      if (isFirstOpenRef.current) {
        overlayEl.style.transform = `translateY(${scrollY}px)`;
        isFirstOpenRef.current = false;
      }
    } else {
      // For desktop, compensate for the negative body top shift
      overlayEl.style.transform = `translateY(${scrollY}px)`;
    }

    return () => {
      // Restore original transform (default was 'none')
      overlayEl.style.transform = originalTransform || "none";
    };
  }, [isOpen, isTouchDevice, selectedProject]); // FIX: Add selectedProject dependency to reset positioning

  // Track modal content when it opens or content changes
  useEffect(() => {
    if (isOpen && selectedProject) {
      // Delay tracking to ensure modal content is rendered
      const timer = setTimeout(() => {
        trackAllElements();

        if (process.env.NODE_ENV === "development") {
          console.log("📊 Modal auto-tracking stats:", getModalTrackingStats());
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedProject, trackAllElements, getModalTrackingStats]);

  // FIX: Reset positioning reference when modal closes or project changes
  useEffect(() => {
    if (!isOpen) {
      isFirstOpenRef.current = true;
    }
  }, [isOpen, selectedProject]);

  // Early return - keep it simple and working
  if (!isOpen) {
    return null;
  }

  console.log("ProjectModal render:", { isOpen, selectedProject, title });

  // FIX: Enhanced scroll prevention and restoration with better mobile handling
  useEffect(() => {
    if (isOpen) {
      // Store more original styles for better restoration
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      const originalBodyHeight = document.body.style.height;
      const originalDocumentHeight = document.documentElement.style.height;
      const originalBodyTouchAction = document.body.style.touchAction;
      const scrollY = window.scrollY;

      if (process.env.NODE_ENV === "development") {
        console.log("Setting up scroll prevention - scrollY:", scrollY);
      }

      // Prevent scrolling while keeping background visible
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // FIX: For mobile devices, store more state and apply better positioning
      if (isTouchDevice) {
        setMobileScrollY(scrollY); // Store scroll position for modal positioning
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.documentElement.style.height = "100%";
        document.body.style.touchAction = "none";
      }

      // FIX: Improved touch scroll prevention with better content detection
      const preventTouchScroll = (e: TouchEvent) => {
        const target = e.target as HTMLElement;

        // Allow scrolling within the modal content, but prevent on the overlay
        if (e.target === overlayRef.current) {
          e.preventDefault();
        }

        // FIX: Also prevent if touching outside content areas
        const isContentArea =
          target.closest('[ref="contentRef"]') ||
          target.closest("img") ||
          target.closest("video") ||
          target.closest("iframe");

        if (!isContentArea && e.target === overlayRef.current) {
          e.preventDefault();
        }
      };

      // Add touch event listeners with passive: false to ensure preventDefault works
      document.addEventListener("touchstart", preventTouchScroll, {
        passive: false,
      });
      document.addEventListener("touchmove", preventTouchScroll, {
        passive: false,
      });

      return () => {
        if (process.env.NODE_ENV === "development") {
          console.log("Restoring scroll - scrollY:", scrollY);
        }

        // FIX: Restore original overflow
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;

        // FIX: Improved restoration for mobile devices
        if (isTouchDevice) {
          document.body.style.position = originalBodyPosition;
          document.body.style.top = originalBodyTop;
          document.body.style.width = originalBodyWidth;
          document.body.style.height = originalBodyHeight;
          document.documentElement.style.height = originalDocumentHeight;
          document.body.style.touchAction = originalBodyTouchAction;

          // FIX: Force scroll restoration and re-enable interactions
          window.scrollTo(0, scrollY);
          document.body.style.pointerEvents = "auto";

          // FIX: Force re-render/reflow to ensure header reappears and scrolling works
          setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
          }, 100);

          setMobileScrollY(0); // Reset mobile scroll position
        }

        // Remove touch event listeners
        document.removeEventListener("touchstart", preventTouchScroll);
        document.removeEventListener("touchmove", preventTouchScroll);
      };
    }
  }, [isOpen, isTouchDevice]);

  // FIX: Enhanced device detection with orientation change support
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );

      if (process.env.NODE_ENV === "development") {
        console.log(
          "Touch device detection - isTouch:",
          "ontouchstart" in window || navigator.maxTouchPoints > 0
        );
      }
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    // FIX: Add orientation change detection for mobile devices
    window.addEventListener("orientationchange", checkTouchDevice);

    return () => {
      window.removeEventListener("resize", checkTouchDevice);
      window.removeEventListener("orientationchange", checkTouchDevice);
    };
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowRight":
          if (hasNext) onNext();
          break;
        case "ArrowLeft":
          if (hasPrevious) onPrevious();
          break;
        case "ArrowDown":
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: 300, behavior: "smooth" });
          }
          break;
        case "ArrowUp":
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: -300, behavior: "smooth" });
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, hasNext, hasPrevious]);

  // Cleanup effect to ensure no interference when modal is closed
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts or isOpen changes
      if (!isOpen) {
        // Ensure no pointer-events interference
        document.body.style.pointerEvents = "";
        // Clear any transforms that might interfere
        const overlayEl = overlayRef.current;
        if (overlayEl) {
          overlayEl.style.transform = "none";
        }
      }
    };
  }, [isOpen, isTouchDevice]);

  // FIX: Enhanced close handler with mobile delay and error boundary
  const handleClose = () => {
    // FIX: Block early closures using isModalSettled
    if (!isModalSettled) {
      if (process.env.NODE_ENV === "development") {
        console.log("Close blocked - modal not settled yet");
      }
      return;
    }

    try {
      // FIX: Add delay for mobile to allow animations/transitions to complete
      if (isTouchDevice) {
        setTimeout(() => {
          onClose();
        }, 200);
      } else {
        onClose();
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error in handleClose:", error);
      }
      // Fallback: still try to close
      onClose();
    }
  };

  // FIX: Enhanced overlay clickable logic with extended delay for mobile
  useEffect(() => {
    if (isOpen) {
      overlayClickable.current = false;
      setIsModalSettled(false);

      // FIX: Extend delay to 500ms for mobile, keep 250ms for desktop
      const overlayDelay = isTouchDevice ? 500 : 250;
      const overlayTimer = setTimeout(() => {
        overlayClickable.current = true;
      }, overlayDelay);

      // FIX: Set modal settled after 300ms delay
      const settledTimer = setTimeout(() => {
        setIsModalSettled(true);
      }, 300);

      return () => {
        clearTimeout(overlayTimer);
        clearTimeout(settledTimer);
      };
    }
  }, [isOpen, isTouchDevice]);

  // FIX: Enhanced overlay click handler with better mobile touch detection
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Overlay click detected - isTouch:",
        isTouchDevice,
        "target:",
        (e.target as HTMLElement).tagName,
        "overlayClickable:",
        overlayClickable.current,
        "isModalSettled:",
        isModalSettled
      );
    }

    // FIX: Prevent immediate close right after opening (especially on mobile)
    if (!overlayClickable.current || !isModalSettled) {
      if (process.env.NODE_ENV === "development") {
        console.log("Overlay click ignored - not ready");
      }
      return;
    }

    // FIX: Add e.stopPropagation() to prevent event bubbling
    e.stopPropagation();

    // FIX: Enhanced touch device handling - strictly limit closure to overlay element only
    if (isTouchDevice) {
      // Only close if clicking directly on the overlay background
      if (e.target === overlayRef.current) {
        if (process.env.NODE_ENV === "development") {
          console.log("Touch device overlay click - closing modal");
        }
        handleClose();
      }
      return;
    }

    // On desktop, close if clicking on overlay or content area marked as closeable
    if (
      e.target === overlayRef.current ||
      (e.target as HTMLElement)?.closest('[data-clickable-area="close"]')
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("Desktop overlay click - closing modal");
      }
      handleClose();
    }
  };

  // FIX: Enhanced touch handlers that ignore content elements
  const handleTouchMove = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;

    // FIX: Ignore events if they target content elements (images, videos, contentRef area)
    const isContentElement =
      target.closest("img") ||
      target.closest("video") ||
      target.closest("iframe") ||
      target.closest('[ref="contentRef"]') ||
      contentRef.current?.contains(target);

    if (isContentElement) {
      return; // Allow legitimate interactions inside the modal
    }

    // Only prevent if touching the overlay itself, not content within
    if (e.target === overlayRef.current) {
      e.preventDefault();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;

    // FIX: Ignore events if they target content elements (images, videos, contentRef area)
    const isContentElement =
      target.closest("img") ||
      target.closest("video") ||
      target.closest("iframe") ||
      target.closest('[ref="contentRef"]') ||
      contentRef.current?.contains(target);

    if (isContentElement) {
      return; // Allow legitimate interactions inside the modal
    }

    // Only prevent if touching the overlay itself, not content within
    if (e.target === overlayRef.current) {
      e.preventDefault();
    }
  };

  const handleImageClick = (imageSrc: string) => {
    setEnlargedImage(imageSrc);
  };

  // Track scroll position
  const handleScroll = useCallback(
    (e: any) => {
      const target = e.target;
      const scrollPercent =
        (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
      setScrollProgress(Math.min(scrollPercent, 100));

      if (!hasScrolled && target.scrollTop > 0) {
        setHasScrolled(true);
      }
    },
    [hasScrolled]
  );

  // New useEffect for handling mobile viewport height
  useEffect(() => {
    const setDocHeight = () => {
      document.documentElement.style.setProperty(
        "--doc-height",
        `${window.innerHeight}px`
      );
    };

    if (isTouchDevice) {
      window.addEventListener("resize", setDocHeight);
      setDocHeight();
    }

    return () => {
      if (isTouchDevice) {
        window.removeEventListener("resize", setDocHeight);
      }
    };
  }, [isTouchDevice]);

  const renderContentSection = (section: ContentSection) => {
    return (
      <div className="space-y-0">
        {section.content.map((item, i) => (
          <div
            key={i}
            className="w-full min-h-[80vh] flex flex-col md:flex-row items-center justify-center py-4 md:py-4 pl-4 pr-8 md:pl-10 md:pr-6"
            data-image-info={JSON.stringify(item)}
            ref={(el) => {
              if (el) imageRefs.current.set(item.image, el);
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-full md:w-full flex items-center justify-center h-full">
                {/* Debug logging for development */}
                {process.env.NODE_ENV === "development" &&
                  (() => {
                    console.log("Rendering content item:", {
                      image: item.image,
                      title: item.title,
                      isVimeo:
                        item.image.startsWith("vimeo:") ||
                        item.image.includes("vimeo.com"),
                    });
                    return null;
                  })()}
                {item.image.startsWith("vimeo:") ||
                item.image.includes("vimeo.com") ? (
                  <LazyVimeoEmbed
                    videoId={
                      item.image.startsWith("vimeo:")
                        ? item.image.replace("vimeo:", "").trim()
                        : item.image.includes("player.vimeo.com/video/")
                          ? item.image
                              .split("player.vimeo.com/video/")[1]
                              .split("?")[0]
                          : item.image.replace("vimeo:", "").trim()
                    }
                    title={item.title}
                  />
                ) : item.image.endsWith(".mp4") ||
                  item.image.endsWith(".webm") ||
                  item.image.endsWith(".mov") ? (
                  <LazyVideo
                    src={item.image}
                    title={item.title}
                    autoPlay={false}
                    controls={true}
                    className="w-full h-[60vh] object-contain mx-auto"
                  />
                ) : (
                  <OptimizedImage
                    src={item.image}
                    alt={item.title}
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

  const renderPDFSection = (
    pdfUrl: string,
    title: string,
    parentTitle?: string
  ) => (
    <div
      className={`w-full ${!isTouchDevice ? "snap-start" : ""} flex flex-col items-stretch justify-center py-0 md:py-6 m-0 md:px-14 h-[80vh]`}
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
    if (selectedProject === "Creative Advertising") {
      return (
        // FIX: Add key to force re-render on project change for fresh positioning
        <div key={selectedProject} className="space-y-0">
          {talesFromTheSunCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    talesFromTheSunCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else if (selectedProject === "BumbleGanttWithTheWind") {
      return (
        <div key={selectedProject} className="space-y-0">
          {bumbleGanttCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    bumbleGanttCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else if (selectedProject === "CreativeCoding") {
      return (
        <div key={selectedProject} className="space-y-0">
          {creativeCodingCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    creativeCodingCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else if (selectedProject === "SmokeAnimation") {
      return (
        <div key={selectedProject} className="space-y-0">
          {smokeAnimationCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    smokeAnimationCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else if (selectedProject === "Illustrations") {
      return (
        <div key={selectedProject} className="space-y-0">
          {illustrationCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    illustrationCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else if (selectedProject === "Tag") {
      return (
        <div key={selectedProject} className="space-y-0">
          {tagCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    tagCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else if (selectedProject === "Truckmate") {
      return (
        <div key={selectedProject} className="space-y-0">
          {truckmateCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    truckmateCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else if (selectedProject === "MySafetyTV") {
      return (
        <div key={selectedProject} className="space-y-0">
          {mysafetyTVCampaign.sections.map((section, idx) => (
            <div key={idx}>
              {"content" in section
                ? renderContentSection(section)
                : renderPDFSection(
                    section.pdfUrl,
                    section.title,
                    mysafetyTVCampaign.title
                  )}
            </div>
          ))}
        </div>
      );
    } else {
      // For projects with just a single image
      return (
        <div
          key={selectedProject}
          className={`w-full ${!isTouchDevice ? "snap-start" : ""} flex items-center justify-center py-10 md:py-16 px-4 md:px-14`}
          data-image-info={JSON.stringify({
            image: image,
            title: "",
            description: "",
          })}
        >
          <div className="w-full md:w-[90%] mx-auto flex items-center justify-center">
            <OptimizedImage
              src={image}
              alt={title}
              onClick={() => handleImageClick(image)}
              isPriority={true}
            />
          </div>
        </div>
      );
    }
  };

  const modal = (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[100] overflow-hidden ${
        isTouchDevice
          ? "bg-white dark:bg-black" // Opaque background for mobile/touch devices
          : "bg-white/95 dark:bg-black/95 backdrop-blur-md" // Light/dark semi-transparent with blur for desktop
      }`}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        // Only apply backdrop filters on non-touch devices for performance
        backdropFilter: isTouchDevice ? "none" : "blur(8px) saturate(180%)",
        WebkitBackdropFilter: isTouchDevice
          ? "none"
          : "blur(8px) saturate(180%)",
        width: "100vw",
        height: isTouchDevice ? "var(--doc-height, 100vh)" : "100vh",
        maxHeight: isTouchDevice ? "var(--doc-height, 100vh)" : "100vh",
        // FIX: Ensure modal is anchored correctly relative to pre-open scroll position
        top: isTouchDevice ? `${mobileScrollY}px` : 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        // FIX: Use consistent translateY compensation for mobile
        transform: isTouchDevice ? `translateY(-${mobileScrollY}px)` : "none",
        touchAction: "none", // Additional touch prevention
        position: "fixed", // Ensure fixed positioning on mobile
      }}
    >
      {/* Minimal header strip */}
      {!enlargedImage && (
        <div className="absolute top-0 left-0 right-0 z-[110] bg-white/30 dark:bg-black/30 backdrop-blur-sm">
          <div className="relative flex items-center px-3 md:px-4 py-2 md:py-3">
            {/* Left side - About and Contact links (desktop only) */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/about"
                className="p-2 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-200 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white text-sm font-medium min-h-[44px] flex items-center"
              >
                ABOUT
              </Link>
              <Link
                href="/contact"
                className="p-2 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-200 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white text-sm font-medium min-h-[44px] flex items-center"
              >
                CONTACT
              </Link>
            </div>

            {/* Mobile spacer to maintain center alignment */}
            <div className="md:hidden w-0"></div>

            {/* Center - Jakob's Portfolio (absolutely centered) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-black/90 dark:text-white/90 text-sm md:text-base lg:text-lg font-recoleta font-bold">
              Jakob's Portfolio
            </div>

            {/* Right side - Close button */}
            <div className="ml-auto">
              <button
                onClick={handleClose}
                className="p-2 md:p-3 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-200 hover:scale-110 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-black dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar - at the true bottom edge of header */}
      <div className="absolute top-[50px] md:top-[58px] left-0 right-0 h-[1px] bg-black/10 dark:bg-white/15 backdrop-blur-sm z-[106]">
        <div
          className="h-full bg-black/70 dark:bg-white/80 transition-all duration-500 ease-out blur-[0.5px]"
          style={{
            width: `${scrollProgress}%`,
            filter: "blur(0.5px)",
            boxShadow:
              scrollProgress > 0
                ? "0 0 8px rgba(0,0,0,0.3), 0 0 4px rgba(255,255,255,0.2)"
                : "none",
          }}
        />
      </div>

      {/* Navigation buttons - hidden on mobile */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none hidden md:flex z-[110]">
        <button
          onClick={onPrevious}
          className={`pointer-events-auto p-4 md:p-5 rounded-full transform transition-all bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 ${hasPrevious ? "opacity-80 hover:opacity-100 hover:scale-110" : "opacity-40 cursor-not-allowed"}`}
          disabled={!hasPrevious}
          aria-label="Previous project"
          style={{ zIndex: 111 }}
        >
          <ChevronLeft className="h-8 w-8 text-black dark:text-white" />
        </button>

        <button
          onClick={onNext}
          className={`pointer-events-auto p-4 md:p-5 rounded-full transform transition-all bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 ${hasNext ? "opacity-80 hover:opacity-100 hover:scale-110" : "opacity-40 cursor-not-allowed"}`}
          disabled={!hasNext}
          aria-label="Next project"
          style={{ zIndex: 111 }}
        >
          <ChevronRight className="h-8 w-8 text-black dark:text-white" />
        </button>
      </div>

      {/* Modal content - constrained to viewport */}
      <div
        ref={modalContainerRef}
        className="flex flex-col md:flex-row w-full h-full px-3 pt-16 md:pt-18 pb-8 md:gap-2 lg:gap-3 justify-start max-w-full max-h-full overflow-hidden"
        style={{
          // FIX: Ensure proper positioning to prevent offset issues
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Content area */}
        <div
          ref={contentRef}
          data-clickable-area={isTouchDevice ? "" : "close"}
          onScroll={handleScroll}
          // FIX: Add touch event isolation to prevent interference with overlay
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="w-full md:w-[60%] lg:w-[62%] flex-1 relative md:pr-4 lg:pr-6 max-w-full max-h-full md:pb-8 pb-32"
          style={{
            // FIX: For touch devices, set overflow-y: auto to allow internal scrolling
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          onClick={(e) => {
            // Don't close on touch devices to prevent accidental closes
            if (isTouchDevice) {
              return;
            }

            // Don't close if clicking on images, videos, or interactive elements
            const target = e.target as HTMLElement;
            if (
              target.tagName === "IMG" ||
              target.tagName === "VIDEO" ||
              target.tagName === "IFRAME" ||
              target.closest("img") ||
              target.closest("video") ||
              target.closest("iframe")
            ) {
              e.stopPropagation();
            }
          }}
        >
          <div className="w-full">{renderContent()}</div>
        </div>

        {/* Title and description sidebar - desktop only (enhanced) */}
        <div className="hidden md:block md:w-[35%] lg:w-[32%] xl:w-[30%] md:pl-6 lg:pl-8 xl:pl-10 md:pr-14 lg:pr-20 xl:pr-24 flex-none flex flex-col overflow-y-auto mt-4 lg:mt-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4 max-w-full max-h-full">
          <div className="text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-orange-500 mb-3 leading-tight">
              {title}
            </h2>
            <p className="text-base text-black/90 dark:text-white/90 mb-6 leading-relaxed">
              {description}
            </p>

            {/* Current image information */}
            <div className="mt-4 border-t border-black/10 dark:border-white/10 pt-4 min-h-[100px] relative">
              {activeItem &&
                activeItem.title &&
                activeItem.title !== selectedProject && (
                  <div className="transition-all duration-200 ease-out">
                    <h3 className="font-mono text-lg font-bold text-orange-500 mb-1 leading-tight">
                      {activeItem.title}
                    </h3>
                    {activeItem.description && (
                      <p className="text-sm text-black/80 dark:text-white/80 leading-normal">
                        {activeItem.description}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* MODIFICATION: Mobile bottom text overlay with improved "View more" functionality */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 dark:from-black/90 via-white/70 dark:via-black/70 to-transparent p-4 z-[120]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 1rem) + 1rem)",
        }}
      >
        <div className="text-left">
          <h2 className="text-lg font-bold text-orange-500 mb-2">{title}</h2>
          <div className="relative">
            <p
              ref={overviewTextRef}
              className={`text-sm text-black/90 dark:text-white/90 leading-relaxed transition-all duration-300 ${isOverviewExpanded ? "" : "line-clamp-2"}`}
            >
              {description}
            </p>
            {showOverviewMore && (
              <button
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                className="text-xs text-black/70 dark:text-white/70 underline mt-1 hover:text-black dark:hover:text-white transition-colors"
              >
                {isOverviewExpanded ? "View less" : "View more"}
              </button>
            )}
          </div>

          {/* Current image information for mobile */}
          {activeItem &&
            activeItem.title &&
            activeItem.title !== selectedProject && (
              <div className="mt-3 pt-3 border-t border-black/20 dark:border-white/20 transition-all duration-200 ease-out">
                <h3 className="font-mono text-sm font-bold text-orange-500 mb-1 leading-tight">
                  {activeItem.title}
                </h3>
                {activeItem.description && (
                  <div className="relative">
                    <p
                      ref={detailsTextRef}
                      className={`text-xs text-black/80 dark:text-white/80 leading-normal ${isDetailsExpanded ? "" : "line-clamp-2"}`}
                    >
                      {activeItem.description}
                    </p>
                    {showDetailsMore && (
                      <button
                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        className="text-xs text-black/60 dark:text-white/60 underline mt-1 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {isDetailsExpanded ? "View less" : "View more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
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

      {/* Memory stats debugger - development only */}
      <MemoryStatsDebugger position="bottom-left" />
    </div>
  );

  // FIX: Enhanced portal creation with conditional check to ensure document.body exists
  return typeof window !== "undefined" && isOpen && document.body
    ? createPortal(modal, document.body)
    : null;
}
