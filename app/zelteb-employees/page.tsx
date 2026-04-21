// Simple Number Guessing Game

class GuessGame {
  private secret: number;
  private attempts: number = 0;

  constructor() {
    this.secret = Math.floor(Math.random() * 100) + 1;
  }

  guess(num: number): string {
    this.attempts++;

    if (num === this.secret) {
      return `🎉 Correct! You guessed in ${this.attempts} attempts.`;
    } else if (num > this.secret) {
      return "Too high!";
    } else {
      return "Too low!";
    }
  }
}

// Run game
const game = new GuessGame();

// For browser:
(window as any).guess = (n: number) => console.log(game.guess(n));

// For Node:
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask() {
  rl.question("Enter number (1-100): ", (input) => {
    const result = game.guess(Number(input));
    console.log(result);

    if (result.includes("Correct")) {
      rl.close();
    } else {
      ask();
    }
  });
}

ask();