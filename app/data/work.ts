// Everything the site shows, in one place. The page, the index, the search
// and the structured data for search engines are all built from this file, so
// adding a piece here is all it takes for it to appear everywhere.

export const MEDIA = "https://media.jakobbackhouse.com/Img_and_Vid";

export type Still = { src: string; w: number; h: number };

export type Media =
  // `w` and `h` are the file's real size. They set its shape on the page
  // before it loads, so nothing jumps.
  | { type: "image"; src: string; w: number; h: number }
  // `paper` puts white behind a clip with a transparent background.
  | {
      type: "video";
      src: string;
      w: number;
      h: number;
      poster?: Still;
      paper?: boolean;
    }
  // `src` is the Vimeo id. A piece with no poster here gets Vimeo's own
  // thumbnail when the site is built (see app/lib/vimeo.ts).
  | { type: "vimeo"; src: string; w: number; h: number; poster?: Still };

export type Piece = { title: string; text: string; media: Media };
export type Section = { title: string; pieces: Piece[] };

export type Motion =
  // `base` is the path shared by the clip's `-av1.mp4` and `-h264.mp4` files.
  | { kind: "clip"; base: string }
  // End the list with the cover so the loop comes back round to it.
  | { kind: "slides"; images: Still[] };

export type Entry = {
  // `id` is the name used in analytics, unchanged from the old site so the
  // reports carry on. `slug` is the address: jakobbackhouse.com/#slug.
  id: string;
  slug: string;
  // A stack and a loop both open into their pieces (a loop has one, which
  // plays by itself), and about opens the bio.
  kind: "stack" | "loop" | "about";
  title: string;
  note?: string;
  text: string;
  // Kept for search engines but left out of the open project.
  hideText?: boolean;
  categories: string[];
  cover: Still;
  // What the cover does when hovered. Loops play on their own.
  motion?: Motion;
  // For loops: the path shared by `-av1.mp4`, `-h264.mp4` and `-poster.webp`.
  loop?: string;
  featured?: boolean;
  // Kept on file but not shown anywhere.
  hidden?: boolean;
  sections: Section[];
};

export const CATEGORIES = ["Animation", "Creative Advertising", "Illustration"];

const image = (src: string, w: number, h: number): Media => ({
  type: "image",
  src,
  w,
  h,
});
const vimeo = (id: string, poster?: Still): Media => ({
  type: "vimeo",
  src: id,
  w: 1920,
  h: 1080,
  poster,
});

const TAG_BACKGROUNDS =
  "Digitally created with watercolour and crayon brushes, these backgrounds represent a child-like view of the world. They are intended to look like a child drew them. The bright, saturated colours become more intense as the child's panic grows and things start to warp and distort. Initially, the background colours and style were more grounded and based on reference, but gradually, through colour scripting and focusing on what the backgrounds needed to represent for the narrative, they became more playful, distorted, and colourful.";

const TAG_STORYBOARD =
  "This storyboard went through a few iterations before coming to its final state. Initially, the main character was a girl when I was working with a friend—Michelle Pretorious—but I decided to make it a boy so I could use myself as a reference more easily. The storyboard was created in Storyboard Pro. It was helpful writing notes alongside each frame for fleshing out aspects further and being creative with the possibilities. I also learned that figuring out how long each specific action (at least roughly) should take before doing any animation was very helpful, as it allowed me to get a better sense of the scene before committing and to properly plan out how long everything should take.";

const TAG_MONSTER_DEV =
  "For these monster developments, I was thinking about how I could show them moving around my scene three-dimensionally. So I modified my original drawings by constructing them around basic shapes. Although I felt like some of the original personality was lost in these, for the final monsters shown in the scene, the monsters were modified a bit further.";

const CODING_PHOTO =
  "Photo manipulated with p5.js to create a pixelated, painterly effect evoking childhood walks. Based in Central Park, Wellington, NZ.";

const tagBackground = (
  n: number,
  file: string,
  w: number,
  h: number
): Piece => ({
  title: `Background ${n}`,
  text: TAG_BACKGROUNDS,
  media: image(`${MEDIA}/Tag/Backgrounds/${file}.webp`, w, h),
});

const tagStoryboard = (
  n: number,
  file: string,
  w: number,
  h: number
): Piece => ({
  title: `Storyboard Frame ${n}`,
  text: TAG_STORYBOARD,
  media: image(`${MEDIA}/Tag/Storyboards/TagFullStoryboard${file}.png`, w, h),
});

const ALL_ENTRIES: Entry[] = [
  {
    id: "Tag",
    slug: "tag",
    kind: "stack",
    title: "Tag",
    featured: true,
    text: "Inspired by a personal moment of fever-induced terror, this narrative follows a child's game of tag with monsters as it spirals into a terrifying chase, climaxing in a moment of imagined injury. The work uses frame-by-frame animation, distorted backgrounds, abstract shapes, and unsettlingly childish monsters to convey how panic overwhelms logic. A subtle 'rubber hose' aesthetic makes reality feel unstable, while environments inspired by Wellington, NZ, serve as a metaphor for panic's uncontrollable force versus the struggle for control. The film acts as a window into this state for those unfamiliar, and as a source of comfort for those who have experienced it. It depicts emotional extremes where survival instinct overrides reason. The completed trailer will be used to promote the full short film, attract collaborators for sound design, and target film festivals like NZIFF and Show Me Shorts, building an audience and network for the project.",
    categories: ["Animation"],
    cover: { src: "/videos/tag-thumbnail-v01.webp", w: 1920, h: 1080 },
    motion: { kind: "clip", base: "/videos/tag-tile-v01" },
    sections: [
      {
        title: "Main Trailer",
        pieces: [
          {
            title: "Tag Trailer",
            text: "Trailer for Tag to promote the short film to potential collaborators and film festivals. It is a scene directly from the short film, so it could also be used as a proof of concept.",
            media: vimeo("1093033927", {
              src: `${MEDIA}/Tag/TagThumbnailHeroSection.webp`,
              w: 3198,
              h: 1858,
            }),
          },
          {
            title: "Tag Full Short Film Animatic",
            text: "I began storyboarding this concept years ago in collaboration with Michelle Pretorious. We each developed storyboards intending to animate whichever we preferred together. Though our collaboration ended due to time constraints, I chose to develop my early storyboard individually. What started as a personally interesting animation revealed deeper meaning through reflective practices: documenting my thoughts through writing, getting feedback from peers, friends, and lecturers through the animatic, character development, and a poem.",
            media: vimeo("1104662194"),
          },
        ],
      },
      {
        title: "Backgrounds",
        pieces: [
          tagBackground(1, "Background0.5", 3031, 1669),
          tagBackground(2, "Background1", 3057, 1648),
          tagBackground(3, "Background2", 3045, 1670),
          tagBackground(4, "Background3", 3055, 1654),
          tagBackground(5, "Background5", 3041, 1659),
          tagBackground(6, "Background5.5", 3045, 1653),
          tagBackground(7, "Background5.75", 3006, 1621),
          tagBackground(8, "Background6", 3035, 1626),
          tagBackground(9, "Background7", 3020, 1626),
          {
            title: "Alternative Background Style",
            text: "During the process of creating these backgrounds, I experimented with many different styles. This style was too detailed and realistic. I like my new backgrounds because they are more expressive of the character's inner world.",
            media: image(
              `${MEDIA}/Tag/Backgrounds/OriginalFence%20Background.webp`,
              4364,
              2454
            ),
          },
        ],
      },
      {
        title: "Character Development",
        pieces: [
          {
            title: "Initial Character Model Sheet Sketches",
            text: "When developing my character, I initially thought about creating them out of simple shapes so they could be easily manipulated in 3D. I also knew that since the short film revolved around the character's expressions, the face would have to be able to show this.",
            media: image(
              `${MEDIA}/Tag/Development/Character_Model_Sheet_Sketches.webp`,
              2388,
              1668
            ),
          },
          {
            title: "Character Color Picking",
            text: "While figuring out what colour I wanted my character to be, I wanted them to feel relatable so the audience could see themselves in them.",
            media: image(
              `${MEDIA}/Tag/Development/CharacterColourPicking.webp`,
              4942,
              1668
            ),
          },
          {
            title: "Character Model Sheet - Color",
            text: "Later, the colour of my character changed from this. It had too much of a Simpsons feeling to it with the yellow. It gave the character a naive, happy-go-lucky feeling that did not fit the story.",
            media: image(
              `${MEDIA}/Tag/Development/Character_Model_Sheet_Colour.webp`,
              2314,
              1668
            ),
          },
          {
            title: "Character Style Exploration",
            text: "Visual style development and character design refinement.",
            media: image(
              `${MEDIA}/Tag/Development/CharacterStyle.webp`,
              1917,
              1668
            ),
          },
        ],
      },
      {
        title: "Monster Development",
        pieces: [
          {
            title: "Monster Initial Sketches",
            text: "These monsters were inspired by child-like depictions of monsters because they are intended to look like they came from a child's imagination. As with the backgrounds, I used a digital crayon brush to create them.",
            media: image(
              `${MEDIA}/Tag/Development/MonstersOG.webp`,
              3202,
              4476
            ),
          },
          {
            title: "Monster Development Sketches",
            text: TAG_MONSTER_DEV,
            media: image(
              `${MEDIA}/Tag/Development/MonsterConcepts.webp`,
              5500,
              3914
            ),
          },
          {
            title: "Monster Development",
            text: TAG_MONSTER_DEV,
            media: image(
              `${MEDIA}/Tag/Development/MonsterDev.webp`,
              2066,
              1638
            ),
          },
        ],
      },
      {
        title: "Color Script & Storyboard",
        pieces: [
          {
            title: "Color Script Draft",
            text: "Creating a colour script was a really helpful exercise in breaking me away from realistic colours. While creating this, I focused only on how the colours made me feel and whether this was right for the story.",
            media: image(
              `${MEDIA}/Tag/Storyboards/ColourScriptDraft1.webp`,
              6911,
              4745
            ),
          },
          tagStoryboard(1, "1", 488, 599),
          tagStoryboard(2, "2", 486, 598),
          tagStoryboard(3, "3", 490, 601),
          tagStoryboard(4, "4", 487, 600),
          tagStoryboard(5, "5", 493, 606),
          tagStoryboard(6, "6", 494, 607),
          tagStoryboard(7, "7", 490, 600),
          tagStoryboard(8, "7.5", 487, 599),
          tagStoryboard(9, "8", 492, 607),
          tagStoryboard(10, "9", 503, 614),
        ],
      },
      {
        title: "Poster Designs",
        pieces: [
          {
            title: "Mock-up Cinema Poster",
            text: "A mock-up of what the poster would look like if it was printed as a cinema poster in Light House Cinemas, Wellington, on Cuba Street.",
            media: image(
              `${MEDIA}/Tag/TrailerCollateral/TagPoster_Cinema.webp`,
              2500,
              1666
            ),
          },
        ],
      },
      {
        title: "Backhouse Studios",
        pieces: [
          {
            title: "Backhouse Studios",
            text: "A studio logo design that I created for my own studio. I wanted it to feel authentic to myself.",
            media: image(
              `${MEDIA}/Tag/TrailerCollateral/BackhouseStudios.webp`,
              2388,
              1668
            ),
          },
        ],
      },
    ],
  },
  {
    id: "CreativeCoding",
    slug: "creative-coding",
    kind: "stack",
    title: "Creative Coding",
    text: "How can I create an image manipulator in p5.js that can turn any photo into a painting? What type of images and style should I use to convey the feeling of going for bush walks when I was younger? To create this effect, I thought about how paintings are made and what makes them look like paintings. The primary reason is the effect of using a brush, so the focus of the project was creating the effect of brush strokes in the slightly random but logical way that a painter would create them.",
    categories: ["Illustration"],
    cover: { src: `${MEDIA}/CreativeCoding/output_2.webp`, w: 1920, h: 640 },
    motion: {
      kind: "slides",
      images: [
        { src: `${MEDIA}/CreativeCoding/output_3.webp`, w: 1920, h: 640 },
        { src: `${MEDIA}/CreativeCoding/output_1.webp`, w: 1920, h: 640 },
        { src: `${MEDIA}/CreativeCoding/output_2.webp`, w: 1920, h: 640 },
      ],
    },
    sections: [
      {
        title: "Final Paintings",
        pieces: [
          {
            title: "Example Photo 1",
            text: CODING_PHOTO,
            media: image(`${MEDIA}/CreativeCoding/output_3.webp`, 1920, 640),
          },
          {
            title: "Example Photo 2",
            text: CODING_PHOTO,
            media: image(`${MEDIA}/CreativeCoding/output_1.webp`, 1920, 640),
          },
          {
            title: "Example Photo 3",
            text: CODING_PHOTO,
            media: image(`${MEDIA}/CreativeCoding/output_2.webp`, 1920, 640),
          },
        ],
      },
    ],
  },
  {
    id: "Illustrations",
    slug: "illustrations",
    kind: "stack",
    title: "Illustrations & Paintings",
    text: "A collection of digital paintings, illustrations, and traditional artworks exploring various themes and techniques.",
    categories: ["Illustration"],
    cover: {
      src: `${MEDIA}/PersonalPaintings/SaddleRoadQuickSketch.webp`,
      w: 2160,
      h: 2700,
    },
    motion: {
      kind: "slides",
      images: [
        { src: `${MEDIA}/PersonalPaintings/BrightLights.webp`, w: 2480, h: 3508 },
        {
          src: `${MEDIA}/PersonalPaintings/HighaltitudeLandScape(compressed).webp`,
          w: 5752,
          h: 8136,
        },
        { src: `${MEDIA}/PersonalPaintings/New_Series.webp`, w: 3508, h: 2480 },
        {
          src: `${MEDIA}/PersonalPaintings/Run(compressed).webp`,
          w: 1906,
          h: 2700,
        },
        { src: `${MEDIA}/PersonalPaintings/11.webp`, w: 4961, h: 3508 },
        { src: `${MEDIA}/PersonalPaintings/photobash.webp`, w: 3508, h: 4961 },
        {
          src: `${MEDIA}/PersonalPaintings/RBackgroundScene3Pencil(0.4).webp`,
          w: 4364,
          h: 2454,
        },
        {
          src: `${MEDIA}/PersonalPaintings/SaddleRoadQuickSketch.webp`,
          w: 2160,
          h: 2700,
        },
      ],
    },
    sections: [
      {
        title: "Landscapes & Environments",
        pieces: [
          {
            title: "High Altitude Landscape",
            text: "Personal digital painting done in Photoshop. I was inspired by a walk I went on a long time ago in Mangawhero Forest. I loved the extreme colours and the sparkling, magical feeling everything had.",
            media: image(
              `${MEDIA}/PersonalPaintings/HighaltitudeLandScape(compressed).webp`,
              5752,
              8136
            ),
          },
          {
            title: "Alternative Tag Tennis Court Background",
            text: "This background was created at an early stage when working on TAG. It would have been nice to continue this style for the rest of the backgrounds but it was very time consuming.",
            media: image(
              `${MEDIA}/PersonalPaintings/RBackgroundScene3Pencil(0.4).webp`,
              4364,
              2454
            ),
          },
          {
            title: "Saddle Road Quick Study",
            text: "Personal digital painting done in Photoshop. A quick study based on a photo my mum took on Saddle Road.",
            media: image(
              `${MEDIA}/PersonalPaintings/SaddleRoadQuickSketch.webp`,
              2160,
              2700
            ),
          },
          {
            title: "Wellington Rooftop",
            text: "Personal digital painting done in Procreate. First in a series exploring light and shadow based on Wellington and other city tropes and characters taken from the animated film Akira.",
            media: image(
              `${MEDIA}/PersonalPaintings/New_Series.webp`,
              3508,
              2480
            ),
          },
        ],
      },
      {
        title: "Dynamic Scenes & Character Studies",
        pieces: [
          {
            title: "Run",
            text: "Personal digital painting created in Photoshop, based on a photo taken in the forest next to the Mount Victoria lookout in Wellington.",
            media: image(
              `${MEDIA}/PersonalPaintings/Run(compressed).webp`,
              1906,
              2700
            ),
          },
          {
            title: "Bright Lights",
            text: "Personal digital painting created in Procreate, based on a personal experience I had climbing around abandoned buildings in Wellington.",
            media: image(
              `${MEDIA}/PersonalPaintings/BrightLights.webp`,
              2480,
              3508
            ),
          },
          {
            title: "Photobash",
            text: "Mixed media digital artwork combining photography and painting. It was primarily an exercise to learn how to photobash in Photoshop, but I created a narrative of aliens invading a city and warping time, as they are interdimensional aliens.",
            media: image(
              `${MEDIA}/PersonalPaintings/photobash.webp`,
              3508,
              4961
            ),
          },
        ],
      },
      {
        title: "Experimental Works",
        pieces: [
          {
            title: "Abstract Alien World Painting",
            text: "This is a digital painting created on top of a Blender model. I honestly can't remember what the concept behind this painting was.",
            media: image(`${MEDIA}/PersonalPaintings/11.webp`, 4961, 3508),
          },
        ],
      },
    ],
  },
  {
    id: "DesignCampaigns",
    slug: "design-campaigns",
    kind: "stack",
    title: "Design Campaigns",
    text: "Three campaigns in one place: Tales from the Sun, Bumble ICK and Truckmate.",
    hideText: true,
    categories: ["Animation", "Creative Advertising"],
    // A close crop of Storyboard_TalesFromTheSun.webp, which is shown in full
    // inside the project.
    cover: {
      src: "/videos/design-campaigns-thumbnail-v01.webp",
      w: 1600,
      h: 1062,
    },
    // One image from each of the three campaigns.
    motion: {
      kind: "slides",
      images: [
        { src: `${MEDIA}/GanttWithTheWind/KickTheIckSlide.webp`, w: 1868, h: 1048 },
        {
          src: `${MEDIA}/TruckMate/Jakob_Backhouse_BMD1R6_Mockup.webp`,
          w: 8333,
          h: 5188,
        },
        { src: "/videos/design-campaigns-thumbnail-v01.webp", w: 1600, h: 1062 },
      ],
    },
    sections: [
      {
        title: "Tales from the Sun: Storyboard",
        pieces: [
          {
            title: "Tales from the Sun: Storyboard",
            text: "A small team and I were tasked with creating a campaign to spread awareness about sun safety in New Zealand. We developed a campaign that used cheesy and grotesque horror tropes to convince people to be more sun safe. A horror-inspired video ad for sun safety targeting young males. Uses 80s 'Tales From the Crypt' and 2000s scary movie aesthetics.",
            media: image(
              `${MEDIA}/TalesFromTheSun/Storyboard_TalesFromTheSun.webp`,
              9094,
              5429
            ),
          },
        ],
      },
      {
        title: "Tales from the Sun: Campaign Strategy",
        pieces: [
          {
            title: "Tales from the Sun: The Issue",
            text: "Young males in NZ have a 'she'll be right' attitude about sun protection despite high UV levels.",
            media: image(
              `${MEDIA}/TalesFromTheSun/TheIssueTalesFromTheSun.webp`,
              1864,
              1041
            ),
          },
          {
            title: "Tales from the Sun: Campaign Insight",
            text: "Young males care about being attractive to the opposite gender. The campaign links sun damage to being undesirable.",
            media: image(
              `${MEDIA}/TalesFromTheSun/InsightTalesFromTheSun.webp`,
              1869,
              1047
            ),
          },
          {
            title: "Tales from the Sun: Single Minded Message",
            text: "Don't be a crayfish, wear sunblock.",
            media: image(
              `${MEDIA}/TalesFromTheSun/SingleMindedMessageTalesFromTheSun.webp`,
              1868,
              1045
            ),
          },
        ],
      },
      {
        title: "Bumble ICK: Storyboards",
        pieces: [
          {
            title: "Bumble ICK: Storyboard",
            text: "A mock Bumble collaboration addressing Gen Z's use of 'ICKs' as excuses for human imperfections. Promotes Bumble as an open, safe platform for vulnerability.",
            media: image(
              `${MEDIA}/GanttWithTheWind/Storyboard_BumbleICK%20(2).webp`,
              5295,
              8113
            ),
          },
          {
            title: "Bumble ICK: Insight",
            text: "Gen Z develops ICKs as excuses for human imperfections. The campaign promotes Bumble as a safe space for vulnerability.",
            media: image(
              `${MEDIA}/GanttWithTheWind/GenZDevelopsICKSSlide.webp`,
              1865,
              1044
            ),
          },
          {
            title: "Bumble ICK: Billboard",
            text: "Provocative billboard design for the BumbleGantt campaign targeting a Gen Z audience.",
            media: image(
              `${MEDIA}/GanttWithTheWind/KickTheIckSlide.webp`,
              1868,
              1048
            ),
          },
          {
            title: "Bumble ICK: Single Minded Message",
            text: "Catching an ICK is bad for you. Promotes a compassionate, inclusive dating culture.",
            media: image(
              `${MEDIA}/GanttWithTheWind/CatchingIcksIsBadForYou.webp`,
              1865,
              1046
            ),
          },
        ],
      },
      {
        title: "Truckmate: Main Explainer Video",
        pieces: [
          {
            title: "Truckmate: Explainer Video",
            text: "Within a month, I went through a design sprint using the human-centred design process: observing and empathising with my environment, identifying a problem, and then iteratively finding a design solution. In my local area, I noticed there were truck communication and congestion issues, often with three pizza stores and many other fast food outlets in very close proximity to each other in a confusing area to access. After interviewing truck drivers and conducting market research, I found that most truck drivers used Google Maps, which does not provide the essential information they need. The final explainer video for Truckmate. Primarily shown on YouTube but also designed for other social media platforms.",
            media: vimeo("1105289689"),
          },
        ],
      },
      {
        title: "Truckmate: Storyboard & Animatic",
        pieces: [
          {
            title: "Truckmate: Project Animatic",
            text: "Storyboard animatic showing the narrative flow and timing for the explainer video. During the creation of this, I focused on the key message I wanted to communicate and how to do this efficiently in 30 seconds.",
            media: vimeo("1104663506"),
          },
        ],
      },
      {
        title: "Truckmate: Logo Animation",
        pieces: [
          {
            title: "Truckmate: Animated Logo",
            text: "Dynamic logo animation created for the Truckmate brand identity. To be shown at the end of video ads. Potentially even as a moving logo on a website.",
            media: {
              type: "video",
              src: `${MEDIA}/TruckMate/Jakob_Backhouse_BMDR16_Animated-Logo.webm`,
              w: 1920,
              h: 1080,
              poster: {
                src: "/videos/truckmate-logo-poster-v01.webp",
                w: 960,
                h: 540,
              },
              // The clip has a transparent background and black lettering.
              paper: true,
            },
          },
        ],
      },
      {
        title: "Truckmate: Promotional Materials",
        pieces: [
          {
            title: "Truckmate: Promotional Poster",
            text: "The idea behind this poster was that it would strike a chord with truckers when they are out late at night and don't know where they are going because their app doesn't give them truck-specific information.",
            media: image(
              `${MEDIA}/TruckMate/Jakob_Backhouse_BMD1R6_Mockup.webp`,
              8333,
              5188
            ),
          },
        ],
      },
    ],
  },
  {
    id: "SmokeAnimation",
    slug: "smoke-animation",
    kind: "stack",
    title: "Smoke Animation",
    text: "A personal film about addiction made in Blender Grease Pencil. Exploring the feeling of withdrawing from an addiction, my character makes his way through a journey on a train, from irritation and panic to eventual recovery. A bear intermittently comes into view, tempting the character to smoke. People crowd the train, and the character plunges into a panic where he almost loses his sanity, only to barely resist smoking as the train comes out of the tunnel.",
    categories: ["Animation"],
    cover: {
      src: `${MEDIA}/Smoke/SmokeThumbnail(Safari).webp`,
      w: 1867,
      h: 1006,
    },
    motion: { kind: "clip", base: "/videos/smoke-tile-v01" },
    sections: [
      {
        title: "Final Animation",
        pieces: [
          {
            title: "Smoke Animation",
            text: "The full short film.",
            media: vimeo("913926901", {
              src: `${MEDIA}/Smoke/SmokeThumbnail(Safari).webp`,
              w: 1867,
              h: 1006,
            }),
          },
          {
            title: "Smoke Animatic",
            text: "The animatic was similar to the final animation, but some scenes were cut due to time constraints. The first establishing shot of the city is one I would like to add in. Although the suffocating effect of always being in the train works for the film in conveying the inescapable feeling of addiction.",
            media: vimeo("1104662949"),
          },
        ],
      },
      {
        title: "Storyboard",
        pieces: [
          {
            title: "Storyboard Panel 1",
            text: "Establishes the train setting and mood. The bear appears as a transcendent character when light passes.",
            media: image(`${MEDIA}/Smoke/StoryBoard.webp`, 4961, 3508),
          },
          {
            title: "Storyboard Panel 2",
            text: "The character gets increasingly annoyed with train noises. The bear irritates him further.",
            media: image(`${MEDIA}/Smoke/StoryBoard1.webp`, 4961, 3508),
          },
          {
            title: "Storyboard Panel 3",
            text: "People pile into the train as it enters a tunnel. The character reaches his darkest moment.",
            media: image(`${MEDIA}/Smoke/StoryBoard2.webp`, 4961, 3508),
          },
          {
            title: "Storyboard Panel 4",
            text: "The character, bewildered, goes for a smoke. The train leaves the tunnel, revealing a great view.",
            media: image(`${MEDIA}/Smoke/StoryBoard3.webp`, 4961, 3508),
          },
          {
            title: "Storyboard Panel 5",
            text: "The character is confused but accepting and happy for the first time in a long while. He is snapped out of his daze by 'Alright'—he arrives at his destination.",
            media: image(`${MEDIA}/Smoke/StoryBoard4.webp`, 4961, 3508),
          },
        ],
      },
      {
        title: "Character Sheets",
        pieces: [
          {
            title: "Character Look Development",
            text: "Reference drawings for character expressions. Since the film revolves around the character's face, I thought it was important to get some solid references.",
            media: image(
              `${MEDIA}/Smoke/CharacterLookDevelopment.webp`,
              3508,
              4961
            ),
          },
          {
            title: "Bear and Character Sketches",
            text: "Preparatory sketches exploring different looks. I chose the simplest designs for easy animation.",
            media: image(
              `${MEDIA}/Smoke/BearAndCharacterSketches.webp`,
              4961,
              3508
            ),
          },
        ],
      },
      {
        title: "Experimental Animation",
        pieces: [
          {
            title: "Animation Experiments",
            text: "Proof of concept experiment. The first 2D animation I've ever done.",
            media: {
              type: "video",
              src: `${MEDIA}/Smoke/BackhouseJakob_ANFX301_Project3.webm`,
              w: 1536,
              h: 864,
              poster: {
                src: "/videos/smoke-experiment-poster-v01.webp",
                w: 960,
                h: 540,
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "MySafetyTV",
    slug: "mysafetytv",
    kind: "stack",
    title: "MySafetyTV",
    hidden: true,
    text: "I worked for an online safety training company called MySafetyTV. One other person and I were tasked with creating the animated explainer videos for the company. There was a 2–4 week turnaround for each video from concept to execution. These videos are part of a learning course that my co-worker and I created.",
    categories: ["Animation", "Creative Advertising"],
    cover: {
      src: `${MEDIA}/MySafetyTV/MySafetyTVThumbnail(Safari).webp`,
      w: 1837,
      h: 879,
    },
    sections: [
      {
        title: "Main Training Video",
        pieces: [
          {
            title: "Heavy Vehicle Restraining Loads",
            text: "Safety training video focusing on proper heavy vehicle load restraining techniques and best practices. Created in After Effects and Blender, combining 2D and 3D animation.",
            media: vimeo("855235415"),
          },
          {
            title: "Heavy Vehicle Distractions",
            text: "Safety training video focusing on the dangers of distractions for heavy vehicle operators. Created in After Effects and Blender, combining 2D and 3D animation.",
            media: vimeo("1105289544"),
          },
          {
            title: "Heavy Vehicle Speeding",
            text: "Safety training video focusing on the dangers of speeding for heavy vehicle operators. Created in After Effects and Blender, combining 2D and 3D animation.",
            media: vimeo("1105289367"),
          },
        ],
      },
      {
        title: "Storyboard Development",
        pieces: [
          {
            title: "MySafetyTV Storyboard",
            text: "Storyboard development for a promotional video to be used on the MySafetyTV website. Created in Procreate.",
            media: image(
              `${MEDIA}/MySafetyTV/Storyboard_MySafetyTV.webp`,
              2500,
              4495
            ),
          },
          {
            title: "MySafetyTV Storyboard Panel 2",
            text: "Storyboard development for a promotional video to be used on the MySafetyTV website. Created in Procreate.",
            media: image(
              `${MEDIA}/MySafetyTV/Storyboard_MySafetyTV%201.webp`,
              2500,
              5614
            ),
          },
        ],
      },
    ],
  },
  {
    id: "3D Animation",
    slug: "3d-animation",
    kind: "stack",
    title: "3D Animation",
    text: "A selection of 3D work created in Blender, Maya and Unreal Engine.",
    categories: ["Animation"],
    cover: { src: `${MEDIA}/PigBoyPortfolio/Pigboy.webp`, w: 1080, h: 1080 },
    // Stills from the films in this project.
    motion: {
      kind: "slides",
      images: [
        { src: "/videos/3d-tile-stagefright-v01.webp", w: 720, h: 720 },
        {
          src: `${MEDIA}/PigBoyPortfolio/SpiritzThumbnail-min.jpg`,
          w: 3264,
          h: 1896,
        },
        { src: "/videos/3d-tile-sunchaser-v01.webp", w: 720, h: 720 },
        { src: "/videos/3d-tile-sculpture-v01.webp", w: 720, h: 720 },
        { src: `${MEDIA}/PigBoyPortfolio/Pigboy.webp`, w: 1080, h: 1080 },
      ],
    },
    sections: [
      {
        title: "Animations",
        pieces: [
          {
            title: "Spiritz",
            text: "A short film created in Unreal Engine over the course of one week for a university assignment. The story follows a simple journey about searching for a friend, with all 3D environments designed and built by me.",
            media: vimeo("1109286944", {
              src: `${MEDIA}/PigBoyPortfolio/SpiritzThumbnail-min.jpg`,
              w: 3264,
              h: 1896,
            }),
          },
          {
            title: "Pigboy",
            text: "During the Covid lockdown, I developed a 3D character named Pigboy using Blender, Maya, Unreal Engine, Marvelous Designer, and After Effects. Inspired by the jester archetype, Pigboy is a cursed character who would fit perfectly into a medieval fantasy story.",
            media: image(`${MEDIA}/PigBoyPortfolio/Pigboy.webp`, 1080, 1080),
          },
          {
            title: "Pigboy Stage Fright",
            text: "Pigboy drops his juggling ball on stage, capturing a moment of vulnerability.",
            media: vimeo("1109520003", {
              src: "/videos/3d-tile-stagefright-v01.webp",
              w: 720,
              h: 720,
            }),
          },
          {
            title: "Pigboy Stagefright POV",
            text: "A point-of-view shot as Pigboy reaches down to pick up his juggling ball.",
            media: vimeo("1109520044"),
          },
          {
            title: "Tim Christie Wolf Sculpture",
            text: "I was commissioned to create a 3D model based on a 2D wolf painting by Tim Christie. Using Blender and creative camera focal length techniques, I achieved the illusion of the model shifting from 3D to 2D.",
            media: vimeo("1109287367"),
          },
          {
            title: "Tim Christie Dubai Sculpture",
            text: "Tim Christie requested a 3D model of his concept for a woven metal sculpture. Working from only a 2D SVG file, I figured out how to model a complex woven structure in Blender.",
            media: vimeo("1109287279", {
              src: "/videos/3d-tile-sculpture-v01.webp",
              w: 720,
              h: 720,
            }),
          },
          {
            title: "Sun Chaser",
            text: "A quick short film inspired by the myth of Icarus. I created the environment, character, and animation entirely in Blender.",
            media: vimeo("1109286695", {
              src: "/videos/3d-tile-sunchaser-v01.webp",
              w: 720,
              h: 720,
            }),
          },
        ],
      },
    ],
  },
  {
    id: "DuckHuntingSeason",
    slug: "duck-hunting-season",
    kind: "loop",
    title: "Duck Hunting Season",
    note: "Work in progress",
    text: "Duck Hunting Season, work in progress animation loop.",
    categories: ["Animation"],
    cover: {
      src: "/videos/duck-hunting-season-wip-v01a-poster.webp",
      w: 1280,
      h: 722,
    },
    loop: "/videos/duck-hunting-season-wip-v01a",
    sections: [],
  },
  {
    id: "Rose",
    slug: "rose",
    kind: "loop",
    title: "Rose",
    note: "Loop",
    text: "Animation loop of a rose growing and blooming.",
    categories: ["Animation"],
    cover: { src: "/videos/flower-growing-v01-poster.webp", w: 960, h: 542 },
    loop: "/videos/flower-growing-v01",
    sections: [],
  },
  {
    id: "About",
    slug: "about",
    kind: "about",
    title: "About",
    text: "My name is Jakob, I am a Wellington-based designer and animator based in Mount Victoria.",
    categories: ["Illustration"],
    cover: { src: `${MEDIA}/WebsitePortfolio.webp`, w: 2298, h: 2115 },
    sections: [
      {
        title: "About",
        pieces: [
          {
            title: "Self portrait",
            text: "Illustration by Jakob Backhouse of an artist drawing on a tablet at a desk by a window, surrounded by plants, books and an easel.",
            media: image(`${MEDIA}/WebsitePortfolio.webp`, 2298, 2115),
          },
        ],
      },
    ],
  },
];

// A loop is a single piece: its own clip.
for (const entry of ALL_ENTRIES) {
  if (entry.kind === "loop" && entry.loop) {
    // The piece's caption says the same thing, so it isn't shown twice.
    entry.hideText = true;
    entry.sections = [
      {
        title: "Loops",
        pieces: [
          {
            title: entry.title,
            text: entry.text,
            media: {
              type: "video",
              src: entry.loop,
              w: entry.cover.w,
              h: entry.cover.h,
              poster: entry.cover,
              paper: true,
            },
          },
        ],
      },
    ];
  }
}

/** Everything on the wall, in the order it appears. */
export const ENTRIES = ALL_ENTRIES.filter((entry) => !entry.hidden);
/** The projects: entries that open into more than one piece. */
export const STACKS = ENTRIES.filter((entry) => entry.kind === "stack");

export const bySlug = (slug: string) =>
  ENTRIES.find((entry) => entry.slug === slug);

export type FlatPiece = Piece & { section: string };

const flatCache = new Map<string, FlatPiece[]>();
/** An entry's pieces as one list, each remembering its section. */
export const piecesOf = (entry: Entry): FlatPiece[] => {
  let flat = flatCache.get(entry.slug);
  if (!flat) {
    flat = entry.sections.flatMap((section) =>
      section.pieces.map((piece) => ({ ...piece, section: section.title }))
    );
    flatCache.set(entry.slug, flat);
  }
  return flat;
};

export const ABOUT = {
  greeting: "Kia ora!",
  bio: "My name is Jakob, I am a Wellington-based designer and animator based in Mount Victoria.",
  email: "JakobBackhouse@gmail.com",
  skills: [
    "Digital Illustration",
    "Storyboarding",
    "UI Design",
    "Instructional Design",
    "3D Environment Design",
    "After Effects Vector Animation or Toon Boom Frame by Frame Animation",
  ],
  // `current` roles are the ones that run to now.
  experience: [
    {
      years: "2021-2023",
      role: "Learning and Motion Designer",
      place: "AXIOM Training",
      current: false,
    },
    {
      years: "2023-Now",
      role: "UX Designer and Website Developer",
      place: "MySafetyTV/Sharpdrive",
      current: true,
    },
    {
      years: "2025-Now",
      role: "Junior Designer / Technical Lead",
      place: "Locales",
      href: "https://locales.co.nz/index",
      current: true,
    },
  ] as {
    years: string;
    role: string;
    place: string;
    href?: string;
    current: boolean;
  }[],
};

export const CONTACT = {
  email: "jakobbackhouse@gmail.com",
  instagram: "https://www.instagram.com/jakobbackhouse_/",
  linkedin: "https://www.linkedin.com/in/jakob-backhouse/",
};
