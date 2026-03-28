import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Volume2, Music, RotateCcw } from 'lucide-react';
import audioEngine from '../utils/audioEngine';
import gameManager from '../utils/gameManager';
import './ChordTraining.css';

export function ChordTraining({ onBack, onUpdateGameState }) {
  const [currentChord, setCurrentChord] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [playCount, setPlayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  // 音符选项（C3到B5），按钢琴键盘顺序
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
    const newChord = audioEngine.generateRandomTriad([3, 4, 5]);
    setCurrentChord(newChord);
    setShowResult(false);
    setSelectedAnswers([]);
    setPlayCount(0);
  };

  // 播放当前和弦
  const playChord = () => {
    if (currentChord) {
      // 使用钢琴音色逐个播放和弦中的音符
      currentChord.notes.forEach(noteId => {
        const note = noteId.slice(0, -1);
        const octave = parseInt(noteId.slice(-1));
        audioEngine.playPianoNote(note, octave, 1.5);
      });
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
    setSelectedAnswers([]);
    setIsCorrect(false);
    setPlayCount(0);
  };

  // 播放指定音符（用于复盘）
  const playNoteForReview = (noteItem) => {
    audioEngine.playPianoNote(noteItem.note, noteItem.octave, 1.0);
  };

  // 选择/取消选择音符 或 答题后播放音符（复盘）
  const handleNoteClick = (noteItem) => {
    if (showResult) {
      // 答题后点击播放音符进行复盘
      playNoteForReview(noteItem);
      return;
    }

    // 播放音符
    audioEngine.playPianoNote(noteItem.note, noteItem.octave, 0.5);

    const noteId = noteItem.id;
    // 答题前选择音符
    setSelectedAnswers(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(n => n !== noteId);
      } else {
        if (prev.length < 3) { // 三和弦有3个音符
          return [...prev, noteId];
        }
        return prev;
      }
    });
  };

  // 检查答案
  const checkAnswer = () => {
    if (!currentChord || showResult || selectedAnswers.length !== 3) return;

    // 检查选中的音符是否正确（不考虑顺序和八度，只能选对一个八度内的音符）
    const correctNotes = currentChord.notes.map(n => n.slice(0, -1));
    const selectedNotes = selectedAnswers.map(id => id.slice(0, -1));

    const correct = selectedAnswers.every(id => currentChord.notes.includes(id)) &&
                   currentChord.notes.every(note => selectedAnswers.includes(note));

    setIsCorrect(correct);
    setShowResult(true);

    // 更新游戏状态
    if (correct) {
      const points = 15 + (streak * 3); // 连胜加分，和弦练习分值更高
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
    <div className="chord-training">
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
        <h2 className="training-title">🎼 和弦辨识训练</h2>
        <p className="training-instruction">听音辨和弦 - 选择和弦中的3个音符</p>

        <div className="play-section">
          <button
            className="play-button"
            onClick={playChord}
          >
            <Music size={32} />
            <span>{playCount === 0 ? '播放和弦' : '再次播放'}</span>
          </button>
          <button
            className="standard-a-button"
            onClick={playStandardA}
            title="播放标准音A4"
          >
            <Volume2 size={20} />
            <span>A4 (440Hz)</span>
          </button>
          <p className="play-hint">点击播放按钮，然后选择组成和弦的3个音符</p>
        </div>

        <div className="selection-info">
          <div className="selection-count">
            已选择 <span className="count-number">{selectedAnswers.length}</span>/3 个音符
          </div>
          <div className="selected-notes">
            {selectedAnswers.map(note => (
              <span key={note} className="selected-note">
                {note}
              </span>
            ))}
          </div>
        </div>

        <div className="piano-container">
          <div className="piano-keys">
            {/* 全部白键：21个 */}
            {octaves.map(octave => (
              ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => {
                const noteId = `${note}${octave}`;
                const noteItem = noteOptions.find(n => n.id === noteId);
                const isSelected = selectedAnswers.includes(noteId);
                const isCorrectNote = currentChord?.notes.includes(noteId);
                const isWrongSelection = isSelected && !isCorrectNote && showResult;
                const isCorrectSelection = isSelected && isCorrectNote && showResult;
                const missedCorrect = !isSelected && isCorrectNote && showResult;

                return (
                  <button
                    key={noteId}
                    className={`key white ${isSelected ? 'selected' : ''} ${
                      showResult ? (isCorrectSelection ? 'correct' : '') : ''
                    } ${isWrongSelection ? 'incorrect' : ''} ${
                      missedCorrect ? 'missed' : ''
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
                const isSelected = selectedAnswers.includes(noteId);
                const isCorrectNote = currentChord?.notes.includes(noteId);
                const isWrongSelection = isSelected && !isCorrectNote && showResult;
                const isCorrectSelection = isSelected && isCorrectNote && showResult;
                const missedCorrect = !isSelected && isCorrectNote && showResult;

                return (
                  <button
                    key={noteId}
                    className={`key black ${isSelected ? 'selected' : ''} ${
                      showResult ? (isCorrectSelection ? 'correct' : '') : ''
                    } ${isWrongSelection ? 'incorrect' : ''} ${
                      missedCorrect ? 'missed' : ''
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

        {selectedAnswers.length === 3 && !showResult && (
          <div className="submit-section">
            <button
              className="submit-button duolingo-button"
              onClick={checkAnswer}
            >
              检查答案
            </button>
          </div>
        )}

        {showResult && (
          <div className={`result-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-icon-large">
              {isCorrect ? '🎉' : '🤔'}
            </div>
            <h3 className="result-title">
              {isCorrect ? '完美！' : '继续加油！'}
            </h3>
            <p className="result-message">
              {isCorrect
                ? `正确答案是 ${currentChord.notes.join(' + ')}！+${15 + (streak * 3)} 分`
                : `正确答案是 ${currentChord.notes.join(' + ')}`
            }
            </p>
            <p className="chord-info">
              这是一个 {currentChord.name.split(' ')[1]} {currentChord.name.split(' ')[0]} 和弦
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
        <h4 className="tips-title">💡 和弦辨识技巧</h4>
        <ul className="tips-list">
          <li>听整体的和声效果，而不是单个音符</li>
          <li>大三和弦听起来明亮，小三和弦听起来柔和</li>
          <li>先识别最低音，再分析其他音符的关系</li>
          <li>多听几次，感受和弦的色彩</li>
        </ul>
      </div>
    </div>
  );
}