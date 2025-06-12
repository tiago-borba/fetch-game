import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { BattleScene, LoseScene, WinScene, PlayMoreScene } from "./scenes";

const PointlingsBattle = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.CANVAS,
      width: 414,
      height: 869,
      backgroundColor: "#1a1a1a",
      parent: gameRef.current,
      scene: [BattleScene, WinScene, LoseScene, PlayMoreScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
        alignItems: "center",
        marginTop: 50,
        marginBottom: 50,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "414px",
          height: "869px",
        }}
      >
        <img
          src="assets/iphone-frame.png"
          alt="iPhone Frame"
          style={{
            position: "absolute",
            top: -100,
            left: -190,
            width: "790px",
            height: "1080px",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          ref={gameRef}
          style={{
            width: "414px",
            height: "869px",
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
