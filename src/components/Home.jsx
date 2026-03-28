import React from 'react';
import { Music, Headphones, Zap, Target } from 'lucide-react';
import './Home.css';

export function Home({ onStartTraining }) {
  return (
    <div className="home-container">
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-icon">
            <Music size={80} />
          </div>
          <h1 className="welcome-title">欢迎来到 SoundMaster</h1>
          <p className="welcome-subtitle">
            通过有趣的游戏化训练，提升你的听音能力！
          </p>
        </div>
      </div>

      <div className="training-modes">
        <div className="mode-card note-mode">
          <div className="mode-icon">
            <Headphones size={40} />
          </div>
          <h2 className="mode-title">音符训练</h2>
          <p className="mode-description">
            听音辨音符，提升你的音准辨识能力
          </p>
          <ul className="mode-features">
            <li><Zap size={16} /> 快速提升音高敏感度</li>
            <li><Target size={16} /> 渐进式难度设置</li>
            <li><Zap size={16} /> 即时反馈纠正</li>
          </ul>
          <button
            className="duolingo-button"
            onClick={() => onStartTraining('note')}
          >
            开始音符训练
          </button>
        </div>

        <div className="mode-card chord-mode">
          <div className="mode-icon">
            <Music size={40} />
          </div>
          <h2 className="mode-title">和弦训练</h2>
          <p className="mode-description">
            听音辨和弦，掌握和弦构成音
          </p>
          <ul className="mode-features">
            <li><Zap size={16} /> 三和弦和七和弦</li>
            <li><Target size={16} /> 和弦转位训练</li>
            <li><Zap size={16} /> 详细和弦分析</li>
          </ul>
          <button
            className="duolingo-button"
            onClick={() => onStartTraining('chord')}
          >
            开始和弦训练
          </button>
        </div>
      </div>

      <div className="tips-section">
        <h3 className="tips-title">💡 训练小贴士</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <p className="tip-text">每天坚持练习，连续学习获得额外奖励</p>
          </div>
          <div className="tip-card">
            <p className="tip-text">遇到困难时，可以重复播放音频</p>
          </div>
          <div className="tip-card">
            <p className="tip-text">从简单难度开始，逐步提升挑战</p>
          </div>
          <div className="tip-card">
            <p className="tip-text">关注错误分析，针对性改进</p>
          </div>
        </div>
      </div>
    </div>
  );
}