import Phaser from "phaser";

export default class FullScreenImageScene extends Phaser.Scene {
  constructor() {
    super("FullScreenImageScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#300D38");

    // Main heading
    const message = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 140,
        "Live rewarded.\nDownload the Fetch app.",
        {
          fontFamily: "Helvetica Neue, Arial, sans-serif",
          fontSize: "32px",
          color: "#FFFFFF",
          align: "center",
          wordWrap: { width: 340 },
        }
      )
      .setOrigin(0.5);

    const buttonWidth = 240;
    const buttonHeight = 64;
    const buttonRadius = 24;

    // ---------- Open App Button ----------
    const openBg = this.add.graphics();
    openBg.fillStyle(0xfba919, 1);
    openBg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      buttonRadius
    );

    const openText = this.add
      .text(0, 0, "Open App", {
        fontFamily: "Helvetica Neue, Arial, sans-serif",
        fontSize: "26px",
        color: "#fff",
      })
      .setOrigin(0.5);

    const openButton = this.add.container(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 20,
      [openBg, openText]
    );
    openButton.setSize(buttonWidth, buttonHeight);
    openButton.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    openButton.on("pointerdown", () => {
      window.open("https://fetch.com", "_blank");
    });
    openButton.on("pointerover", () => {
      openBg
        .clear()
        .fillStyle(0xe09b17, 1)
        .fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          buttonRadius
        );
    });
    openButton.on("pointerout", () => {
      openBg
        .clear()
        .fillStyle(0xfba919, 1)
        .fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          buttonRadius
        );
    });

    // ---------- Play Again Button ----------
    const againBg = this.add.graphics();
    againBg.fillStyle(0xffffff, 1);
    againBg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      buttonRadius
    );

    const againText = this.add
      .text(0, 0, "Play Again", {
        fontFamily: "Helvetica Neue, Arial, sans-serif",
        fontSize: "26px",
        color: "#000000",
      })
      .setOrigin(0.5);

    const againButton = this.add.container(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 20 + buttonHeight + 20,
      [againBg, againText]
    );
    againButton.setSize(buttonWidth, buttonHeight);
    againButton.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    againButton.on("pointerdown", () => {
      this.scene.start("BattleScene");
    });
    againButton.on("pointerover", () => {
      againBg
        .clear()
        .fillStyle(0xe0e0e0, 1)
        .fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          buttonRadius
        );
    });
    againButton.on("pointerout", () => {
      againBg
        .clear()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          buttonRadius
        );
    });
  }
}
