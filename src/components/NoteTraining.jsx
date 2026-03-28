import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Volume2, Check, X, RotateCcw } from 'lucide-react';
import audioEngine from '../utils/audioEngine';
import gameManager from '../utils/gameManager';
import './NoteTraining.css';

export function NoteTraining({ onBack, onUpdateGameState }) {
  const [currentNote, setCurrentNote] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [playCount, setPlayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  // 音符选项（C3到B5，共36个音符），按钢琴键盘顺序排列
  const pianoOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  const octaves = [3, 4, 5];
  const noteOptions = pianoOrder.flatMap(note =>
    octaves.map(octave => ({
      id: `${note}${octave}`,
      note,
      octave,
      isBlackKey: blackKeys.includes(note)
    }))
  );

  // 生成新题目
  const generateNewQuestion = () => {
    const newNote = audioEngine.generateRandomNote([3, 4, 5]);
    setCurrentNote(newNote);
    setShowResult(false);
    setSelectedAnswer(null);
    setPlayCount(0);
  };

  // 播放当前音符（使用钢琴音色）
  const playNote = () => {
    if (currentNote) {
      audioEngine.playPianoNote(currentNote.note, currentNote.octave);
      setPlayCount(prev => prev + 1);
    }
  };

  // 播放标准A4
  const playStandardA = () => {
    audioEngine.playStandardA();
  };

  // 重答本题
  const retryQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setPlayCount(0);
  };

  // 播放指定音符（用于复盘）
  const playNoteForReview = (noteItem) => {
    audioEngine.playPianoNote(noteItem.note, noteItem.octave, 1.0);
  };

  // 检查答案 或 答题后播放音符（复盘）
  const handleNoteClick = (noteItem) => {
    if (showResult) {
      // 答题后点击播放音符进行复盘
      playNoteForReview(noteItem);
      return;
    }

    // 答题前检查答案
    if (!currentNote) return;

    const correctNoteId = currentNote.note + currentNote.octave;
    const correct = noteItem.id === correctNoteId;
    setSelectedAnswer(noteItem.id);
    setIsCorrect(correct);
    setShowResult(true);

    // 更新游戏状态
    if (correct) {
      const points = 10 + (streak * 2); // 连胜加分
      gameManager.updateScore(points);
      gameManager.updateStreak(true);
      setStreak(prev => prev + 1);
      setScore(prev => prev + points);

      onUpdateGameState({
        score: gameManager.getState().score,
        streak: gameManager.getState().streak
      });
    } else {
      gameManager.updateStreak(false);
      setStreak(0);

      onUpdateGameState({
        streak: 0
      });
    }
  };

  // 下一题
  const nextQuestion = () => {
    generateNewQuestion();
  };

  // 初始化
  useEffect(() => {
    generateNewQuestion();
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  return (
    <div className="note-training">
      <div className="training-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>返回首页</span>
        </button>
        <div className="training-stats">
          <div className="stat-item">
            <span className="stat-label">连胜</span>
            <span className="stat-value flame">🔥 {streak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">得分</span>
            <span className="stat-value score">⭐ {score}</span>
          </div>
        </div>
      </div>

      <div className="training-content card">
        <h2 className="training-title">🎵 音符辨识训练</h2>
        <p className="training-instruction">听音辨音 - 选择你听到的音符</p>

        <div className="play-section">
          <button
            className="play-button"
            onClick={playNote}
          >
            <Play size={32} />
            <span>{playCount === 0 ? '播放音符' : '再次播放'}</span>
          </button>

          <div className="standard-note-section">
            <button
              className="standard-note-button"
              onClick={playStandardA}
              title="播放标准音A4"
            >
              <Play size={16} />
              <span>A4 (440Hz)</span>
            </button>
            <p className="play-hint">点击播放按钮，然后选择正确的音符。可以使用A4作为参考。</p>
          </div>
        </div>

        <div className="piano-container">
          <div className="piano-keys">
            {/* 全部白键：21个 */}
            {octaves.map(octave => (
              ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => {
                const noteId = `${note}${octave}`;
                const noteItem = noteOptions.find(n => n.id === noteId);
                const isCorrectNote = currentNote && (currentNote.note + currentNote.octave) === noteId;
                const isSelected = selectedAnswer === noteId;
                return (
                  <button
                    key={noteId}
                    className={`key white ${
                      isSelected ? 'selected' : ''
                    } ${
                      showResult
                        ? isSelected
                          ? isCorrect ? 'correct' : 'incorrect'
                          : isCorrectNote && !isCorrect ? 'missed-correct' : ''
                        : ''
                    } ${showResult ? 'reviewable' : ''}`}
                    onClick={() => handleNoteClick(noteItem)}
                  >
                    <span className="key-label">{noteId}</span>
                  </button>
                );
              })
            ))}
            {/* 全部黑键：15个 */}
            {octaves.map(octave => {
              const octaveOffset = (octave - 3) * 350;
              const blackKeyPositions = {
                'C#': 34,
                'D#': 84,
                'F#': 184,
                'G#': 234,
                'A#': 284
              };
              return ['C#', 'D#', 'F#', 'G#', 'A#'].map(note => {
                const noteId = `${note}${octave}`;
                const noteItem = noteOptions.find(n => n.id === noteId);
                const position = octaveOffset + blackKeyPositions[note];
                const isCorrectNote = currentNote && (currentNote.note + currentNote.octave) === noteId;
                const isSelected = selectedAnswer === noteId;
                return (
                  <button
                    key={noteId}
                    className={`key black ${
                      isSelected ? 'selected' : ''
                    } ${
                      showResult
                        ? isSelected
                          ? isCorrect ? 'correct' : 'incorrect'
                          : isCorrectNote && !isCorrect ? 'missed-correct' : ''
                        : ''
                    } ${showResult ? 'reviewable' : ''}`}
                    data-position={position}
                    onClick={() => handleNoteClick(noteItem)}
                  >
                    <span className="key-label">{noteId}</span>
                  </button>
                );
              });
            })}
          </div>
        </div>

        {showResult && (
          <div className={`result-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-icon-large">
              {isCorrect ? '✨' : '😅'}
            </div>
            <h3 className="result-title">
              {isCorrect ? '太棒了！' : '继续努力！'}
            </h3>
            <p className="result-message">
              {isCorrect
                ? `正确答案就是 ${currentNote.note}${currentNote.octave}！+${10 + (streak * 2)} 分`
                : `正确答案是 ${currentNote.note}${currentNote.octave}`}
            </p>
            <div className="result-buttons">
              <button className="retry-button" onClick={retryQuestion}>
                <RotateCcw size={20} />
                重答本题
              </button>
              <button className="next-button duolingo-button" onClick={nextQuestion}>
                下一题 <Play size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="tips-box">
        <h4 className="tips-title">💡 训练技巧</h4>
        <ul className="tips-list">
          <li>多听几次，感受音高</li>
          <li>先从明显的音高差异开始练习</li>
          <li>保持连胜可以获得额外分数</li>
        </ul>
      </div>
    </div>
  );
}