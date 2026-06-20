import { Component, OnInit } from '@angular/core';

interface GuessRow {
  colors: string[];
  hits: number;
  hints: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22'];
  readonly CODE_LENGTH = 4;
  readonly MAX_TRIES = 10;
  readonly pegSlots = [0, 1, 2, 3];

  secret: string[] = [];
  currentGuess: (string | null)[] = [];
  selectedColor: string | null = null;
  history: GuessRow[] = [];
  gameOver = false;
  won = false;
  showNotification = false;

  ngOnInit() {
    this.startNewGame();
  }

  startNewGame() {
    this.secret = Array.from({ length: this.CODE_LENGTH }, () =>
      this.COLORS[Math.floor(Math.random() * this.COLORS.length)]
    );
    this.currentGuess = new Array(this.CODE_LENGTH).fill(null);
    this.selectedColor = null;
    this.history = [];
    this.gameOver = false;
    this.won = false;
    this.showNotification = false;
  }

  selectColor(color: string) {
    this.selectedColor = this.selectedColor === color ? null : color;
  }

  placeColor(index: number) {
    if (this.gameOver) return;
    const updated = [...this.currentGuess];
    updated[index] = this.selectedColor;
    this.currentGuess = updated;
  }

  clearGuess() {
    this.currentGuess = new Array(this.CODE_LENGTH).fill(null);
  }

  get canSubmit(): boolean {
    return !this.gameOver && this.currentGuess.every(c => c !== null);
  }

  submitGuess() {
    if (!this.canSubmit) return;
    const guess = this.currentGuess as string[];
    const { hits, hints } = this.evaluate(guess);
    this.history.push({ colors: [...guess], hits, hints });

    if (hits === this.CODE_LENGTH) {
      this.gameOver = true;
      this.won = true;
      this.showNotification = true;
    } else if (this.history.length >= this.MAX_TRIES) {
      this.gameOver = true;
    } else {
      this.currentGuess = new Array(this.CODE_LENGTH).fill(null);
    }
  }

  private evaluate(guess: string[]): { hits: number; hints: number } {
    let hits = 0;
    const secretLeft: Record<string, number> = {};
    const guessLeft: Record<string, number> = {};

    for (let i = 0; i < this.CODE_LENGTH; i++) {
      if (guess[i] === this.secret[i]) {
        hits++;
      } else {
        secretLeft[this.secret[i]] = (secretLeft[this.secret[i]] || 0) + 1;
        guessLeft[guess[i]] = (guessLeft[guess[i]] || 0) + 1;
      }
    }

    let hints = 0;
    for (const c of Object.keys(guessLeft)) {
      hints += Math.min(guessLeft[c], secretLeft[c] || 0);
    }

    return { hits, hints };
  }

  feedbackPegs(hits: number, hints: number): string[] {
    return [
      ...Array(hits).fill('hit'),
      ...Array(hints).fill('hint'),
      ...Array(this.CODE_LENGTH - hits - hints).fill('miss')
    ];
  }

  get futureRows(): number[] {
    const usedRows = this.history.length + (this.gameOver ? 0 : 1);
    return Array.from({ length: Math.max(0, this.MAX_TRIES - usedRows) }, (_, i) => usedRows + i);
  }
}
