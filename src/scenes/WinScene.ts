import Phaser from "phaser";

export default class WinScene extends Phaser.Scene {
  score: number = 0;

  constructor() {
    super("WinScene");
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    this.cameras.main.setBackgroundColor(0xffffff);

    const video = this.add.video(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "victoryVideo"
    );

    // Get the video dimensions
    const videoWidth = video.width;
    const videoHeight = video.height;

    // Calculate scale factors to fit the video within the screen
    const scaleX = this.cameras.main.width / videoWidth;
    const scaleY = this.cameras.main.height / videoHeight;

    // Use the smaller of the two scale factors to ensure the video is scaled proportionally
    const scale = Math.min(scaleX, scaleY);

    // Apply the scale, and prevent it from stretching
    video.setDisplaySize(videoWidth * scale, videoHeight * scale);

    // Ensure the video is centered on the screen
    video.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);

    // Play the video
    video.play(false);

    video.on("complete", () => {
      alert("complete");
      this.scene.start("FullScreenImageScene");
    });
  }
}
