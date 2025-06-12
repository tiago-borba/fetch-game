import Phaser from "phaser";

const enemies = [
  {
    name: "Mr. Markup",
    hp: 30,
    image: "assets/markup.png",
    pattern: ["light", "heavy", "light", "defend"],
  },
  {
    name: "Expired Coupon",
    hp: 20,
    image: "assets/expired-coupon.png",
    pattern: ["light", "light", "heavy"],
  },
  {
    name: "Pricey Pete",
    hp: 25,
    image: "assets/pricey-pete.png",
    pattern: ["heavy", "heavy", "defend", "light"],
  },
];

export default class BattleScene extends Phaser.Scene {
  updatePlayerHPBar: () => void;
  updateHPBar: () => void;
  updateIntent: () => void;
  enemyIndex = 0;
  enemyMoveIndex = 0;
  score = 0;
  timeLeft = 20;
  paused = false;
  inPlayerAnimation = false;
  inEnemyAnimation = false;
  enemy: { name: string; hp: number; image: string; pattern: string[] } = {
    name: "",
    hp: 0,
    image: "",
    pattern: [],
  };
  playerHP = 100;
  playerCooldowns = { superHit: 0 };
  defending = false;

  enemyText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  intentText: Phaser.GameObjects.Text;
  timer: Phaser.Time.TimerEvent;
  enemyImage: Phaser.GameObjects.Image;
  playerImage: Phaser.GameObjects.Image;
  attackButton: Phaser.GameObjects.Sprite;
  defendButton: Phaser.GameObjects.Sprite;
  superHitButton: Phaser.GameObjects.Sprite;
  createSpriteButton: (
    x: number,
    y: number,
    key: string,
    onClick: (button: Phaser.GameObjects.Sprite) => void
  ) => Phaser.GameObjects.Sprite;
  pauseButton: Phaser.GameObjects.Sprite;

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
    enemies.forEach((enemy) => {
      this.load.image(enemy.name, enemy.image);
    });
  }

  create() {
    const createSpriteButton = (
      x: number,
      y: number,
      key: string,
      onClick: (sprite: Phaser.GameObjects.Sprite) => void
    ): Phaser.GameObjects.Sprite => {
      const sprite = this.add.sprite(x, y, key, 0).setInteractive();
      sprite.on("pointerdown", () => sprite.setFrame(1));
      sprite.on("pointerup", () => {
        onClick(sprite);
        sprite.setFrame(0);
      });
      sprite.on("pointerout", () => sprite.setFrame(0));
      return sprite;
    };

    this.createSpriteButton = createSpriteButton;

    // Adjust background to fit the canvas size
    this.add.image(207, 434, "background").setDisplaySize(414, 869);

    this.enemy = { ...enemies[this.enemyIndex] };

    // Adjust HP bars and other UI elements based on the canvas size
    const hpBarBg = this.add.rectangle(207, 120, 134, 20).setOrigin(0.5);
    hpBarBg.setStrokeStyle(2, 0xffffff);
    const hpBar = this.add
      .rectangle(207, 120, 130, 19, 0x00ff00)
      .setOrigin(0.5);

    this.enemyText = this.add
      .text(207, 90, `${this.enemy.name}`, {
        font: "20px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.updateHPBar = () => {
      const percent = this.enemy.hp / enemies[this.enemyIndex].hp;
      hpBar.width = 130 * Math.max(0, percent);
      if (percent > 0.6) hpBar.setFillStyle(0x00ff00);
      else if (percent > 0.3) hpBar.setFillStyle(0xffff00);
      else hpBar.setFillStyle(0xff0000);
    };

    this.playerImage = this.add.image(207, 640, "player").setScale(0.15);

    const playerHpBg = this.add.rectangle(215, 730, 134, 20).setOrigin(0.5);
    playerHpBg.setStrokeStyle(2, 0xffffff);
    const playerHpBar = this.add
      .rectangle(215, 730, 130, 19, 0x00ff00)
      .setOrigin(0.5);

    this.updatePlayerHPBar = () => {
      const percent = this.playerHP / 100;
      playerHpBar.width = 130 * Math.max(0, percent);
      if (percent > 0.6) playerHpBar.setFillStyle(0x00ff00);
      else if (percent > 0.3) playerHpBar.setFillStyle(0xffff00);
      else playerHpBar.setFillStyle(0xff0000);
      if (this.playerHP <= 0)
        this.scene.start("LoseScene", { score: this.score });
    };
    this.updatePlayerHPBar();

    this.enemyImage = this.add.image(207, 340, this.enemy.name).setScale(0.2);

    this.intentText = this.add
      .text(207, 170, "", {
        font: "18px Arial",
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
      .text(207, 840, `Time: ${this.timeLeft}`, {
        font: "24px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.attackButton = this.createSpriteButton(
      80,
      780,
      "strike_button",
      () => {
        if (!this.paused && !this.inEnemyAnimation && !this.inPlayerAnimation)
          this.useStrike();
      }
    );

    this.defendButton = this.createSpriteButton(
      215,
      780,
      "shield_button",
      () => {
        if (!this.paused && !this.inEnemyAnimation && !this.inPlayerAnimation)
          this.useShield();
      }
    );

    this.superHitButton = this.createSpriteButton(
      340,
      780,
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

    const spritePause = this.add
      .sprite(360, 65, "start_stop_button", 0)
      .setInteractive();

    spritePause.on("pointerdown", () => {
      spritePause.setFrame(this.paused ? 0 : 1);
      this.paused = !this.paused;
      this.time.paused = this.paused;
    });

    this.pauseButton = spritePause;

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
        if (this.inPlayerAnimation || this.inEnemyAnimation) return;
        this.inEnemyAnimation = true;
        if (!this.paused && this.enemy.hp > 0) {
          const pattern = this.enemy.pattern;
          const intent = pattern[this.enemyMoveIndex % pattern.length];
          let damage = 0;
          if (intent === "light") damage = 4;
          else if (intent === "heavy") damage = 9;
          else if (intent === "defend") {
            this.enemy.hp += 3;
            if (this.enemy.hp > enemies[this.enemyIndex].hp)
              this.enemy.hp = enemies[this.enemyIndex].hp;
            this.updateHPBar();
            this.enemyMoveIndex++;
            this.inEnemyAnimation = false;
            this.updateIntent();
            return;
          }
          const finalDamage = this.defending ? Math.floor(damage / 2) : damage;
          this.tweens.add({
            targets: this.enemyImage,
            y: this.playerImage.y + 10,
            duration: 300,
            yoyo: true,
            ease: "Sine.easeInOut",
            onYoyo: () => this.playerImage.setFlip(true, true),
            onComplete: () => {
              this.playerImage.resetFlip();
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

  animateAttack() {
    this.inPlayerAnimation = true;
    this.attackButton.disableInteractive();
    this.tweens.add({
      targets: this.playerImage,
      y: this.enemyImage.y - 80,
      duration: 200,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        this.attackButton.setInteractive({ useHandCursor: true });
        this.inPlayerAnimation = false;
      },
    });
    this.enemyImage.setFlipY(true);
    this.time.delayedCall(500, () => this.enemyImage.resetFlip());
  }

  useStrike() {
    this.animateAttack();
    this.enemy.hp -= 6;
    this.updateEnemyAfterHit();
  }

  useShield() {
    this.defending = true;
    console.log("Defending state: ", this.defending); // Log defending state
    this.playerImage.setTint(0x3399ff);
    this.time.delayedCall(1500, () => {
      this.defending = false;
      console.log("Defending state after call: ", this.defending); // Log after tint clear
      this.playerImage.clearTint();
    });
  }

  useSuperHit() {
    this.animateAttack();
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
