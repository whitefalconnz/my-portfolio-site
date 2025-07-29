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
            "Horror-inspired video ad for sun safety targeting young males. Uses 80s 'Tales From the Crypt' and 2000s scary movie aesthetics.",
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
            "Young males in NZ have a 'she'll be right' attitude about sun protection despite high UV rates.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TalesFromTheSun/InsightTalesFromTheSun.webp",
          title: "Campaign Insight",
          description:
            "Young males care about attractiveness to the opposite gender. Link sun damage to being undesirable.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/TalesFromTheSun/SingleMindedMessageTalesFromTheSun.webp",
          title: "Single Minded Message",
          description: "Don't be a crayfish, wear sunblock",
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
            "Mock Bumble collaboration addressing Gen Z's use of 'ICKs' as excuses for human imperfections. Promotes open, safe platform for vulnerability.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/GenZDevelopsICKSSlide.webp",
          title: "Insight",
          description:
            "Gen Z develops ICKs as excuses for human imperfections. Campaign promotes Bumble as safe space for vulnerability.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/KickTheIckSlide.webp",
          title: "ICK Billboard",
          description:
            "Provocative billboard design for BumbleGantt campaign targeting Gen Z audience.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/CatchingIcksIsBadForYou.webp",
          title: "Single minded message",
          description:
            "Catching an ICK is bad for you. Promotes compassionate, inclusive dating culture.",
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
          title: "Example photo 1",
          description:
            "Photo manipulated with p5.js to create pixelated painterly effect evoking childhood walks.",
        },
      ],
    },
    {
      title: "Concept Development",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_1.webp",
          title: "Example photo 2",
          description: "P5.js photo manipulation with painterly effect.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_2.webp",
          title: "Example photo 3",
          description:
            "P5.js photo manipulation exploring brush stroke effects.",
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
          description:
            "Personal film about addiction made in Blender grease pencil. Explores feeling of being stuck and terrorized.",
        },
        {
          image: "vimeo:1104662949",
          title: "Smoke Animatic",
          description:
            "The animatic was similar to final animation but scenes were cut due to time constraints.",
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
            "Establishes train setting and mood. Bear appears as transcendent character when light passes.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard1.webp",
          title: "Storyboard Panel 2",
          description:
            "Character gets increasingly annoyed with train noises. Bear irritates him further.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard2.webp",
          title: "Storyboard Panel 3",
          description:
            "People pile into train, enters tunnel. Character's darkest moment.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard3.webp",
          title: "Storyboard Panel 4",
          description:
            "Character bewildered, goes for smoke. Train leaves tunnel revealing great view.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/StoryBoard4.webp",
          title: "Storyboard Panel 5",
          description:
            "Character confused but accepting new reality. Snapped out by 'Alright' - arrives at destination.",
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
            "Reference drawings for character expressions since film revolves around character's face.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/BearAndCharacterSketches.webp",
          title: "Bear and Character Sketches",
          description:
            "Preparatory sketches exploring different looks. Chose simplest designs for easy animation.",
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
            "Proof of concept experiment. First 2D animation completed.",
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
            "A serene mountain landscape capturing the majesty of high-altitude environments.",
        },
        {
          image: getCDNUrl(
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/SaddleRoadQuickSketch.webp"
          ),
          title: "Saddle Road Quick Sketch",
          description:
            "Quick study capturing the essence of a rural landscape.",
        },
        {
          image: getCDNUrl(
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/New_Series.webp"
          ),
          title: "Wellington Rooftop",
          description:
            "First in a series exploring light and shadow based on Wellington and other city tropes and characters taken from the animated film Akria.",
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
            "Personal digital painting created in Photoshop, based on a photo taken in the forest next to the Mount Victoria look out in Wellington",
        },
        {
          image: getCDNUrl(
            "https:/media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/BrightLights.webp"
          ),
          title: "Bright Lights",
          description:
            "Personal digital painting created in Procreate, based on a personal experience I had of climbing around abandoned buildings in Wellington",
        },
        {
          image: getCDNUrl(
            "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/photobash.webp"
          ),
          title: "Photobash",
          description:
            "Mixed media digital artwork combining photography and painting. It was primarily an exercise to learn how to photobash in Photoshop. But I created a narrative of aliens invading a city and warping time as they are interdimesnional aliens ",
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
          title: "Series Study #2",
          description: "Second piece exploring natural light phenomena.",
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
            "Born from a personal moment of fever-induced terror, the narrative follows a child's game of tag with monsters as it spirals into a terrifying chase, climaxing in a moment of imagined injury. The work uses frame-by-frame animation, distorted backgrounds, abstract shapes, and unsettlingly childish monsters to convey how panic overwhelms logic. A subtle 'rubber hose' aesthetic makes reality feel unstable, while environments inspired by Wellington, NZ, serve as a metaphor for panic's uncontrollable force versus the struggle for control. The film acts as a window into this state for those unfamiliar, and as a source of comfort for those who have experienced it. It depicts emotional extremes where survival instinct overrides reason. The completed trailer will be used to promote the full short film, attract collaborators for sound design, and target film festivals like NZIFF and Show Me Shorts, building an audience and network for the project.",
        },
        {
          image: "vimeo:1104662194",
          title: "Tag Full Short Film Animatic",
          description:
            "I began storyboarding this concept years ago in collaboration with Michelle Pretorious, we each developed storyboards intending to animate whichever we preferred together. Though our collaboration ended due to time constraints, I chose to develop my early storyboard individually. What started as personally interesting animation revealed deeper meaning through reflective practices of documenting my thoughts through writing, getting feedback from peers, friends and lecturers through the animatic, character development and a poem. ",
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
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distort. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background1.webp",
          title: "Background 2",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distort. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background2.webp",
          title: "Background 3",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distort. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background3.webp",
          title: "Background 4",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distort. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background5.webp",
          title: "Background 5",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distory. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background5.5.webp",
          title: "Background 6",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distory. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background5.75.webp",
          title: "Background 7",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distory. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background6.webp",
          title: "Background 8",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distory. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/Background7.webp",
          title: "Background 9",
          description:
            "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. Intended to look like a child drew them. The bright saturated colours become more intense as the childs panic grows and things start to warp and distory. Inititally the background colours and style was more grounded and based of reference but gradually through colour scripting and focusing on what the backgrounds needed to represent for the narrative they become more playful, disctored and colourful.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Backgrounds/OriginalFence%20Background.webp",
          title: "Alternative background style",
          description:
            "During the process of creating these backgrounds I experimented with many different styles. This style was too detailed and realistic, I like my new backgrounds because they are more expressive of the characters inner world",
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
            "Initially when developing my character I was thinking about creating them out of simple shapes so that they could be easily maniputed in 3D. I also knew that since the shortfilm revolved around the characters expressions that the face would have to be able to show this",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/CharacterColourPicking.webp",
          title: "Character Color Picking",
          description:
            "While figuring out what colour I wanted my character to be I wanted them to feel relatable so the audience could see themselvse in them.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/Character_Model_Sheet_Colour.webp",
          title: "Character Model Sheet - Color",
          description:
            "Later the colour of my character changed from this. It had too much of a simpsons feeling to it with the yellow. It gave the character a naive happy-go-lucky feeling to it that did not fit the story",
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
          title: "Monster Initial sketches",
          description:
            "These monsters were inspired by child like depictions of monsters because they are intended to look like they came from a childs imagination. Like in the backgrounds I used a digital crayon brush to create them.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/MonsterConcepts.webp",
          title: "Monster Development Sketches",
          description:
            "For these monster devemopments I was thinking about how I could show them moving around my scene three dimensionally. So I modifed my original drawings by constructing them around basic shapes. Although I felt like some of the originaly personality was lost in these so for the final monsters shown in the scene the monsters were modified a bit further ",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/MonsterDev.webp",
          title: "Monster Development",
          description:
            "For these monster devemopments I was thinking about how I could show them moving around my scene three dimensionally. So I modifed my original drawings by constructing them around basic shapes. Although I felt like some of the originaly personality was lost in these so for the final monsters shown in the scene the monsters were modified a bit further ",
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
            "Creating a colour script was a really helpful exercise in breaking me away from realistic colours. While creating this I was focusing only on how the colours made me feel and if this was right for the story",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard1.png",
          title: "Storyboard Frame 1",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take ",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard2.png",
          title: "Storyboard Frame 2",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take ",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard3.png",
          title: "Storyboard Frame 3",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard4.png",
          title: "Storyboard Frame 4",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard5.png",
          title: "Storyboard Frame 5",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard6.png",
          title: "Storyboard Frame 6",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard7.png",
          title: "Storyboard Frame 7",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard7.5.png",
          title: "Storyboard Frame 8",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard8.png",
          title: "Storyboard Frame 9",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Storyboards/TagFullStoryboard9.png",
          title: "Storyboard Frame 10",
          description:
            "This storyboard went through a few iterations before coming to its final state. Initially the main character was a girl when I was working with a friend - Michelle Pretorious but I decided to make it a boy so I could use myself as a reference easier. storyboard created in Storyboard Pro, it was helpful writing notes and alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was something that was very helpful since it would allow me to get a better sense of the scene before committing and properly plan out how long everything should take",
        },
      ],
    },
    {
      title: "Poster Designs",
      content: [
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/Tag/TrailerCollateral/TagPoster_Cinema.webp",
          title: "Mock up Cinema Poster",
          description:
            "A mock up of what the poster would look like if it was printed on a cinema poster in light house cinemas wellington on Cuba street",
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
            "A studio logo design that I created for my own studio. I wanted it to feel authentic.",
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
          image: "vimeo: 1105289689",
          title: "Truckmate Explainer Video",
          description:
            "The final explainer video for Truckmate. To be primarily shown on youtube but also designed for other social media platforms",
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
            "Storyboard animatic showing the narrative flow and timing for the explainer video.",
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
            "Dynamic logo animation created for the Truckmate brand identity.",
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
            "Marketing poster design promoting the Truckmate platform and services.",
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
            "Safety training video focusing on proper load restraining techniques and best practices.",
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
            "Safety training video focusing on the dangers of distractions for heavy vehicle operators.",
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
            "Safety training video focusing on the dangers of speeding for heavy vehicle operators.",
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
            "Comprehensive storyboard outlining the visual narrative and educational sequence for the safety training content.",
        },
        {
          image:
            "https://media.jakobbackhouse.com/Img_and_Vid/MySafetyTV/Storyboard_MySafetyTV%201.webp",
          title: "MySafetyTV Storyboard Panel 2",
          description:
            "Continuation of the storyboard showcasing the next sequence in the safety training content.",
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const overlayClickable = useRef(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

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

  // Early return - keep it simple and working
  if (!isOpen) {
    return null;
  }

  console.log("ProjectModal render:", { isOpen, selectedProject, title });

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
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // For mobile devices, also fix the body position to prevent scroll
      if (isTouchDevice) {
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
      }

      // Prevent touch scrolling on the modal overlay
      const preventTouchScroll = (e: TouchEvent) => {
        // Allow scrolling within the modal content, but prevent on the overlay
        if (e.target === overlayRef.current) {
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
        document.removeEventListener("touchstart", preventTouchScroll);
        document.removeEventListener("touchmove", preventTouchScroll);
      };
    }
  }, [isOpen, isTouchDevice]);

  // Device detection
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);

    return () => window.removeEventListener("resize", checkTouchDevice);
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
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

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

    // On touch devices, only close if clicking directly on the overlay background
    if (isTouchDevice) {
      if (e.target === overlayRef.current) {
        handleClose();
      }
      return;
    }

    // On desktop, close if clicking on overlay or content area marked as closeable
    if (
      e.target === overlayRef.current ||
      (e.target as HTMLElement)?.closest('[data-clickable-area="close"]')
    ) {
      handleClose();
    }
  };

  // Prevent touch scrolling on overlay
  const handleTouchMove = (e: React.TouchEvent) => {
    // Only prevent if touching the overlay itself, not content within
    if (e.target === overlayRef.current) {
      e.preventDefault();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
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
        <div className="space-y-0">
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
        <div className="space-y-0">
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
        <div className="space-y-0">
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
        <div className="space-y-0">
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
        <div className="space-y-0">
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
        <div className="space-y-0">
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
        <div className="space-y-0">
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
        <div className="space-y-0">
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
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        transform: "none",
        touchAction: "none", // Additional touch prevention
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
      >
        {/* Content area */}
        <div
          ref={contentRef}
          data-clickable-area={isTouchDevice ? "" : "close"}
          onScroll={handleScroll}
          className="w-full md:w-[60%] lg:w-[62%] flex-1 overflow-y-auto relative md:pr-4 lg:pr-6 max-w-full max-h-full md:pb-8 pb-32"
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

      {/* Mobile bottom text overlay with view more functionality */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 dark:from-black/90 via-white/70 dark:via-black/70 to-transparent p-4 z-[120]">
        <div className="text-left">
          <h2 className="text-lg font-bold text-orange-500 mb-2">{title}</h2>
          <div className="relative">
            <p
              className={`text-sm text-black/90 dark:text-white/90 leading-relaxed transition-all duration-300 ${isTextExpanded ? "" : "line-clamp-2"}`}
            >
              {description}
            </p>
            {description.length > 100 && (
              <button
                onClick={() => setIsTextExpanded(!isTextExpanded)}
                className="text-xs text-black/70 dark:text-white/70 underline mt-1 hover:text-black dark:hover:text-white transition-colors"
              >
                {isTextExpanded ? "View less" : "View more"}
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
                      className={`text-xs text-black/80 dark:text-white/80 leading-normal ${isTextExpanded ? "" : "line-clamp-2"}`}
                    >
                      {activeItem.description}
                    </p>
                    {activeItem.description.length > 80 && (
                      <button
                        onClick={() => setIsTextExpanded(!isTextExpanded)}
                        className="text-xs text-black/60 dark:text-white/60 underline mt-1 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {isTextExpanded ? "View less" : "View more"}
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

  // Render modal via React portal so it overlays entire viewport regardless of scroll context
  return typeof window !== "undefined" && isOpen
    ? createPortal(modal, document.body)
    : null;
}
