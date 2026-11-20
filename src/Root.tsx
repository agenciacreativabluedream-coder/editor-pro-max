import {Composition, Folder, Still} from "remotion";
import {ArbatReelMalDia, MALDIA_FPS, MALDIA_FRAMES} from "./compositions/ArbatReelMalDia";
import {ArbatReelViernes, VIERNES_FPS, VIERNES_FRAMES} from "./compositions/ArbatReelViernes";
import {ArbatReelEdicion, EDICION_FPS, EDICION_FRAMES} from "./compositions/ArbatReelEdicion";
import {ArbatReelASMR, ASMR_FPS, ASMR_FRAMES} from "./compositions/ArbatReelASMR";
import {ArbatReelUltima, REEL_FPS, REEL_FRAMES} from "./compositions/ArbatReelUltima";
import {ArbatL1, ArbatL2, ArbatL3, ArbatL4, ArbatL5, ArbatL5b} from "./compositions/ArbatCarrusel";

// Compositions
import {ShowcaseComposition} from "./compositions/Showcase";

// Social templates
import {TikTokVideo} from "./templates/social/TikTokVideo";
import {InstagramReel} from "./templates/social/InstagramReel";
import {YouTubeShort} from "./templates/social/YouTubeShort";

// Content templates
import {Presentation} from "./templates/content/Presentation";
import {Testimonial} from "./templates/content/Testimonial";

// Promo templates
import {Announcement} from "./templates/promo/Announcement";
import {BeforeAfterDemo} from "./compositions/BeforeAfterDemo";

// Editing templates
import {TalkingHeadEdit} from "./templates/editing/TalkingHeadEdit";
import {PodcastClip} from "./templates/editing/PodcastClip";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Arbat-Carrusel-5-15-30">
        <Still id="ArbatL1" component={ArbatL1} width={1080} height={1440} />
        <Still id="ArbatL2" component={ArbatL2} width={1080} height={1440} />
        <Still id="ArbatL3" component={ArbatL3} width={1080} height={1440} />
        <Still id="ArbatL4" component={ArbatL4} width={1080} height={1440} />
        <Still id="ArbatL5" component={ArbatL5} width={1080} height={1440} />
        <Still id="ArbatL5b" component={ArbatL5b} width={1080} height={1440} />
      </Folder>

      <Folder name="Arbat-Reel-Ultima-Campechana">
        <Composition
          id="ArbatReelUltima"
          component={ArbatReelUltima}
          durationInFrames={REEL_FRAMES}
          fps={REEL_FPS}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="Arbat-Reel-ASMR">
        <Composition
          id="ArbatReelASMR"
          component={ArbatReelASMR}
          durationInFrames={ASMR_FRAMES}
          fps={ASMR_FPS}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="Arbat-Reel-Se-Arregla-En-Edicion">
        <Composition
          id="ArbatReelEdicion"
          component={ArbatReelEdicion}
          durationInFrames={EDICION_FRAMES}
          fps={EDICION_FPS}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="Arbat-Reel-Viernes-4pm">
        <Composition
          id="ArbatReelViernes"
          component={ArbatReelViernes}
          durationInFrames={VIERNES_FRAMES}
          fps={VIERNES_FPS}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="Arbat-Reel-Mal-Dia-Yadi">
        <Composition
          id="ArbatReelMalDia"
          component={ArbatReelMalDia}
          durationInFrames={MALDIA_FRAMES}
          fps={MALDIA_FPS}
          width={1080}
          height={1920}
        />
      </Folder>

      <Folder name="Examples">
        <Composition
          id="Showcase"
          component={ShowcaseComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Social">
        <Composition
          id="TikTok"
          component={TikTokVideo}
          durationInFrames={270}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "Did you know this?",
            body: "AI can edit videos now using just code.",
            cta: "Follow for more",
          }}
        />
        <Composition
          id="InstagramReel"
          component={InstagramReel}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "Your headline here",
            subtext: "Supporting text goes here",
            brandName: "Brand",
          }}
        />
        <Composition
          id="YouTubeShort"
          component={YouTubeShort}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            title: "Your Title Here",
            subtitle: "Subtitle goes here",
          }}
        />
      </Folder>

      <Folder name="Content">
        <Composition
          id="Presentation"
          component={Presentation}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            slides: [
              {title: "Welcome", body: "This is slide one"},
              {title: "The Problem", body: "Here's what we're solving"},
              {title: "The Solution", body: "Here's how we solve it"},
            ],
          }}
        />
        <Composition
          id="Testimonial"
          component={Testimonial}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            quote:
              "This product completely changed how we work. Highly recommended.",
            author: "Jane Doe",
            role: "CEO at Company",
          }}
        />
      </Folder>

      <Folder name="Promo">
        <Composition
          id="Announcement"
          component={Announcement}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            preTitle: "Introducing",
            title: "Something Amazing",
            subtitle: "The future is here",
            cta: "Learn More",
          }}
        />
        <Composition
          id="BeforeAfter"
          component={BeforeAfterDemo}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Editing">
        <Composition
          id="TalkingHeadEdit"
          component={TalkingHeadEdit}
          durationInFrames={900}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            showCaptions: true,
            captionPreset: "bold" as const,
            removeSilence: false,
          }}
        />
        <Composition
          id="PodcastClip"
          component={PodcastClip}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            clipStartSeconds: 0,
            clipEndSeconds: 30,
            showCaptions: true,
            captionPreset: "bold" as const,
          }}
        />
      </Folder>
    </>
  );
};
