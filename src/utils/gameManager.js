// 游戏化管理器
class GameManager {
  constructor() {
    this.state = {
      score: 0,
      streak: 0,
      currentMode: 'note', // 'note' or 'chord'
      currentDifficulty: 'beginner' // 'beginner', 'intermediate', 'advanced'
    };
  }

  // 更新分数
  updateScore(points) {
    this.state.score += points;
    return this.state.score;
  }

  // 更新连胜
  updateStreak(isCorrect) {
    if (isCorrect) {
      this.state.streak++;
    } else {
      this.state.streak = 0;
    }
    return this.state.streak;
  }

  // 重置游戏
  reset() {
    this.state = {
      score: 0,
      streak: 0,
      currentMode: 'note',
      currentDifficulty: 'beginner'
    };
  }

  // 获取当前状态
  getState() {
    return { ...this.state };
  }

  // 设置当前模式
  setMode(mode) {
    this.state.currentMode = mode;
  }

  // 设置当前难度
  setDifficulty(difficulty) {
    this.state.currentDifficulty = difficulty;
  }
}

export default new GameManager();