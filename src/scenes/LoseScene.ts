import Phaser from "phaser";

export default class LoseScene extends Phaser.Scene {
  score: number = 0;

  constructor() {
    super("LoseScene");
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    this.cameras.main.setBackgroundColor("#ffffff");

    const video = this.add.video(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "loseVideo"
    );

    const videoWidth = video.width;
    const videoHeight = video.height;

    const scaleX = this.cameras.main.width / videoWidth;
    const scaleY = this.cameras.main.height / videoHeight;

    const scale = Math.min(scaleX, scaleY);

    video.setDisplaySize(videoWidth * scale, videoHeight * scale);
    video.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);

    video.play(false);

    video.on("complete", () => {
      window.location.href =
        "https://embed.figma.com/proto/t4uFnDLp1hGeOyAWEkvSwP/Fetch-Q1-2?page-id=2246%3A1656&node-id=2395-2822&viewport=17%2C-4442%2C0.74&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2395%3A2822&embed-host=share";
    });
  }
}
