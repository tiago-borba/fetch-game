import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { BattleScene, LoseScene, WinScene, PlayMoreScene } from "./scenes";

const PointlingsBattle = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.WEBGL,
      width: 360,
      height: 640,
      backgroundColor: "#1a1a1a",
      parent: gameRef.current,
      scene: [BattleScene, WinScene, LoseScene, PlayMoreScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.FIT,
      },
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "black",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "360px",
          height: "640px",
          marginTop: "10vh",
        }}
      >
        <img
          src="assets/iphone-frame.png"
          alt="iPhone Frame"
          style={{
            position: "absolute",
            top: -100,
            left: -140,
            width: "640px",
            height: "830px",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          ref={gameRef}
          style={{
            width: "360px",
            height: "640px",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
};

export default PointlingsBattle;
