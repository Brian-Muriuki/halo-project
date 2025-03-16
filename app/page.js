// app/page.js
import React from 'react';
import Chat from './components/Chat';
import Image from 'next/image';

const Home = () => {
  return (
    <div className="container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="welcome-title">Welcome to Halo</h1>
          <p className="welcome-description">
            Your Christian Spiritual Companion for reflection, growth, and guidance
          </p>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">
                <Image 
                  src="/globe.svg" 
                  alt="Community icon" 
                  width={40} 
                  height={40}
                  style={{ 
                    filter: "invert(46%) sepia(82%) saturate(1539%) hue-rotate(210deg) brightness(96%) contrast(96%)" 
                  }}
                />
              </div>
              <h3>Daily Reflection</h3>
              <p>Find peace in scripture and guided spiritual conversations</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <Image 
                  src="/file.svg" 
                  alt="Scripture icon" 
                  width={40} 
                  height={40}
                  style={{ 
                    filter: "invert(46%) sepia(82%) saturate(1539%) hue-rotate(210deg) brightness(96%) contrast(96%)" 
                  }}
                />
              </div>
              <h3>Scripture Guidance</h3>
              <p>Discover relevant verses for your spiritual journey</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <Image 
                  src="/window.svg" 
                  alt="Reflection icon" 
                  width={40} 
                  height={40}
                  style={{ 
                    filter: "invert(46%) sepia(82%) saturate(1539%) hue-rotate(210deg) brightness(96%) contrast(96%)" 
                  }}
                />
              </div>
              <h3>Prayer Companion</h3>
              <p>A supportive presence on your faith journey</p>
            </div>
          </div>
        </div>
        <div className="chat-wrapper">
          <h2>Begin Your Conversation</h2>
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Home;