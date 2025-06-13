import Phaser from "phaser";

const enemies: Enemy[] = [
  {
    name: "Mr. Markup",
    hp: 30,
    image: "assets/markup.png",
    pattern: ["light", "heavy", "light", "defend"] as const,
  },
  {
    name: "Expired Coupon",
    hp: 20,
    image: "assets/expired-coupon.png",
    pattern: ["light", "light", "heavy"] as const,
  },
  {
    name: "Pricey Pete",
    hp: 25,
    image: "assets/pricey-pete.png",
    pattern: ["heavy", "heavy", "defend", "light"] as const,
  },
];

interface Enemy {
  name: string;
  hp: number;
  image: string;
  pattern: ("light" | "heavy" | "defend")[];
}

const scaleX = 360 / 414;
const scaleY = 640 / 869;
const sx = (x: number): number => x * scaleX;
const sy = (y: number): number => y * scaleY;

export default class BattleScene extends Phaser.Scene {
  updatePlayerHPBar!: () => void;
  updateHPBar!: () => void;
  updateIntent!: () => void;
  createSpriteButton!: (
    x: number,
    y: number,
    key: string,
    onClick: (button: Phaser.GameObjects.Sprite) => void
  ) => Phaser.GameObjects.Sprite;

  enemyIndex = 0;
  enemyMoveIndex = 0;
  score = 0;
  timeLeft = 20;
  paused = false;
  inPlayerAnimation = false;
  inEnemyAnimation = false;
  enemy: Enemy = { name: "", hp: 0, image: "", pattern: [] };
  playerHP = 100;
  playerCooldowns = { superHit: 0 };
  defending = false;

  enemyText!: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;
  intentText!: Phaser.GameObjects.Text;
  timer!: Phaser.Time.TimerEvent;
  enemyImage!: Phaser.GameObjects.Image;
  playerImage!: Phaser.GameObjects.Image;
  attackButton!: Phaser.GameObjects.Sprite;
  defendButton!: Phaser.GameObjects.Sprite;
  superHitButton!: Phaser.GameObjects.Sprite;
  pauseButton!: Phaser.GameObjects.Sprite;

  constructor() {
    super("BattleScene");
  }

  preload() {
    this.load.spritesheet("strike_button", "assets/strike_sprite.png", {
      frameWidth: 130,
      frameHeight: 65,
    });
    this.load.spritesheet("shield_button", "assets/shield_sprite.png", {
      frameWidth: 130,
      frameHeight: 65,
    });
    this.load.spritesheet("super_button", "assets/super_sprite.png", {
      frameWidth: 130,
      frameHeight: 65,
    });
    this.load.spritesheet("start_stop_button", "assets/start-stop-sprite.png", {
      frameWidth: 100,
      frameHeight: 50,
    });
    this.load.video("victoryVideo", "assets/victory.mp4", false);
    this.load.video("loseVideo", "assets/lose.mp4", false);
    this.load.image("background", "assets/bg.png");
    this.load.image("player", "assets/pointling.png");
    enemies.forEach((enemy) => this.load.image(enemy.name, enemy.image));
  }

  create() {
    this.createSpriteButton = (x, y, key, onClick) => {
      const sprite = this.add.sprite(sx(x), sy(y), key, 0).setInteractive();
      sprite.on("pointerdown", () => sprite.setFrame(1));
      sprite.on("pointerup", () => {
        onClick(sprite);
        sprite.setFrame(0);
      });
      sprite.on("pointerout", () => sprite.setFrame(0));
      sprite.setScale(0.9);
      return sprite;
    };

    this.add.image(sx(207), sy(434), "background").setDisplaySize(360, 640);
    this.enemy = { ...enemies[this.enemyIndex] };

    const hpBarBg = this.add
      .rectangle(sx(207), sy(120), sx(134), sy(20))
      .setOrigin(0.5);
    hpBarBg.setStrokeStyle(2, 0xffffff);
    const hpBar = this.add
      .rectangle(sx(207), sy(120), sx(130), sy(19), 0x00ff00)
      .setOrigin(0.5);

    this.enemyText = this.add
      .text(sx(207), sy(90), this.enemy.name, {
        font: `${Math.floor(20 * scaleY)}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.updateHPBar = () => {
      const percent = this.enemy.hp / enemies[this.enemyIndex].hp;
      hpBar.width = sx(130) * Math.max(0, percent);
      hpBar.setFillStyle(
        percent > 0.6 ? 0x00ff00 : percent > 0.3 ? 0xffff00 : 0xff0000
      );
    };

    this.playerImage = this.add.image(sx(207), sy(590), "player").setScale(0.1);

    const playerHpBg = this.add
      .rectangle(sx(215), sy(680), sx(134), sy(20))
      .setOrigin(0.5);
    playerHpBg.setStrokeStyle(2, 0xffffff);
    const playerHpBar = this.add
      .rectangle(sx(215), sy(680), sx(130), sy(19), 0x00ff00)
      .setOrigin(0.5);

    this.updatePlayerHPBar = () => {
      const percent = this.playerHP / 100;
      playerHpBar.width = sx(130) * Math.max(0, percent);
      playerHpBar.setFillStyle(
        percent > 0.6 ? 0x00ff00 : percent > 0.3 ? 0xffff00 : 0xff0000
      );
      if (this.playerHP <= 0)
        this.scene.start("LoseScene", { score: this.score });
    };
    this.updatePlayerHPBar();

    this.enemyImage = this.add
      .image(sx(207), sy(340), this.enemy.name)
      .setScale(0.14);

    this.intentText = this.add
      .text(sx(207), sy(170), "", {
        font: `${Math.floor(18 * scaleY)}px Arial`,
        color: "#ffcc00",
      })
      .setOrigin(0.5);

    this.updateIntent = () => {
      const intent =
        enemies[this.enemyIndex].pattern[
          this.enemyMoveIndex % enemies[this.enemyIndex].pattern.length
        ];
      const label = {
        light: "Light Attack",
        heavy: "Heavy Attack!",
        defend: "Defensive Stance",
      }[intent];
      this.intentText.setText(`Enemy: ${label}`);
    };
    this.updateIntent();

    this.timerText = this.add
      .text(sx(207), sy(730), `Time: ${this.timeLeft}`, {
        font: `${Math.floor(28 * scaleY)}px Arial`,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.attackButton = this.createSpriteButton(
      80,
      800,
      "strike_button",
      () => {
        if (!this.paused && !this.inEnemyAnimation && !this.inPlayerAnimation)
          this.useStrike();
      }
    );

    this.defendButton = this.createSpriteButton(
      215,
      800,
      "shield_button",
      () => {
        if (!this.paused && !this.inEnemyAnimation && !this.inPlayerAnimation)
          this.useShield();
      }
    );

    this.superHitButton = this.createSpriteButton(
      340,
      800,
      "super_button",
      () => {
        const now = () => this.time.now;
        if (this.paused || this.inEnemyAnimation || this.inPlayerAnimation)
          return;
        if (now() >= this.playerCooldowns.superHit) {
          this.useSuperHit();
          this.playerCooldowns.superHit = now() + 5000;
        }
      }
    );

    this.pauseButton = this.add
      .sprite(sx(350), sy(60), "start_stop_button", 0)
      .setInteractive();

    this.pauseButton.on("pointerdown", () => {
      this.pauseButton.setFrame(this.paused ? 0 : 1);
      this.paused = !this.paused;
      this.time.paused = this.paused;
    });

    this.pauseButton.setScale(0.9);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 19,
      callback: () => {
        if (!this.paused) {
          this.timeLeft--;
          this.timerText.setText(`Time: ${this.timeLeft}`);
          if (this.timeLeft <= 0)
            this.scene.start("LoseScene", { score: this.score });
        }
      },
    });

    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        if (this.inPlayerAnimation || this.inEnemyAnimation || this.defending)
          return;

        this.inEnemyAnimation = true;
        if (!this.paused && this.enemy.hp > 0) {
          const intent =
            this.enemy.pattern[this.enemyMoveIndex % this.enemy.pattern.length];
          if (intent === "defend") {
            this.enemy.hp = Math.min(
              this.enemy.hp + 3,
              enemies[this.enemyIndex].hp
            );
            this.updateHPBar();
            this.enemyMoveIndex++;
            this.inEnemyAnimation = false;
            this.updateIntent();
            return;
          }
          const damage = intent === "light" ? 4 : 9;
          const finalDamage = this.defending ? Math.floor(damage / 2) : damage;
          this.tweens.add({
            targets: this.enemyImage,
            y: 300,
            duration: 320,
            yoyo: true,
            ease: "Sine.easeInOut",
            onYoyo: () => {
              if (intent === "heavy") {
                this.playerImage.setFlip(true, true);
              }

              this.playerImage.setTint(
                intent === "heavy" ? 0x8000ff : 0xff0000
              );
            },
            onComplete: () => {
              this.playerImage.clearTint();
              if (intent === "heavy") {
                this.playerImage.resetFlip();
              }

              this.inEnemyAnimation = false;
            },
          });
          this.playerHP -= finalDamage;
          this.updatePlayerHPBar();
          this.enemyMoveIndex++;
          this.updateIntent();
        }
      },
    });
  }

  animateAttack(isSuper?: boolean) {
    this.inPlayerAnimation = true;
    this.attackButton.disableInteractive();
    this.tweens.add({
      targets: this.playerImage,
      y: 340,
      duration: 200,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        this.attackButton.setInteractive({ useHandCursor: true });
        this.inPlayerAnimation = false;
      },
    });

    if (isSuper) {
      this.playerImage.setTint(0xff5500);
      this.enemyImage.setFlipY(true);
    }

    this.enemyImage.setTint(isSuper ? 0x8000ff : 0xff0000);
    this.time.delayedCall(500, () => {
      this.enemyImage.clearTint();
      if (isSuper) {
        this.playerImage.clearTint();
        this.enemyImage.resetFlip();
      }
    });
  }

  useStrike() {
    this.animateAttack();
    this.enemy.hp -= 6;
    this.updateEnemyAfterHit();
  }

  useShield() {
    this.defending = true;
    this.playerImage.setTint(0x3399ff);
    this.time.delayedCall(1500, () => {
      this.defending = false;
      this.playerImage.clearTint();
    });
  }

  useSuperHit() {
    this.animateAttack(true);
    this.enemy.hp -= 15;
    this.updateEnemyAfterHit();
  }

  updateEnemyAfterHit() {
    if (this.enemy.hp <= 0) {
      this.score++;
      this.enemyIndex++;
      if (this.enemyIndex >= enemies.length) {
        this.scene.start("WinScene", { score: this.score });
        return;
      }
      this.enemy = { ...enemies[this.enemyIndex] };
      this.enemyImage.setTexture(this.enemy.name);
      this.enemyText.setText(this.enemy.name);
      this.enemyMoveIndex = 0;
    }
    this.updateHPBar();
    this.updateIntent();
  }
}
