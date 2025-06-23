export default {
    accumulatedScore: 0,
    previousScore: 0,
    currentScore: 0,
    currentLevel: 1,

    resetCurrentScore() {
        this.currentScore = 0;
    },

    accumulateScore() {
        this.accumulatedScore += this.currentScore;
    },

    restorePreviousScore() {
        this.currentScore = 0;
        this.accumulatedScore = this.previousScore;
    },    

    nextLevel() {
        this.accumulateScore();
        this.previousScore = this.accumulatedScore;
        this.currentScore = 0;
        this.currentLevel++;
    },

    resetAll() {
        this.accumulatedScore = 0;
        this.currentScore = 0;
        this.currentLevel = 1;
    }
};
