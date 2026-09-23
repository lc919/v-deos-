import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { AberturaScala } from "./AberturaScala";
import { EstruturaStories } from "./stories/EstruturaStories";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="AberturaScala"
        component={AberturaScala}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EstruturaStories"
        component={EstruturaStories}
        durationInFrames={387}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
