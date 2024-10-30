import React, { useState, useEffect } from 'react';
import type { StoryNode } from './types'

function StoryViewer() {
  const [storyData, setStoryData] = useState<StoryNode[]>([]);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [storyName, setStoryName] = useState<string>('cinderella'); // make it dynamic!
  const [displayText, setDisplayText] = useState("");
  const [isTextComplete, setIsTextComplete] = useState(false);

  useEffect(() => {
    fetch(`/story/${storyName}/story.json`)
      .then((response) => response.json())
      .then((data) => {
        setStoryData(data);
        setCurrentNode(data[0]); // 첫 번째 노드로 초기화
      });
  }, [storyName]);

  useEffect(() => {
    if (currentNode) {
      const textArray = currentNode.text.split(""); // 문자열을 배열로 분리
      let index = 0;
      let dText = "";
      setDisplayText("");
      setIsTextComplete(false);

      // 한 글자씩 출력하는 타이핑 효과 구현
      const intervalId = setInterval(() => {
        dText = dText + textArray[index];
        setDisplayText(dText);
        index += 1;
        if (index === textArray.length) {
          clearInterval(intervalId);
          setIsTextComplete(true); // 텍스트 출력 완료 표시
        }
      }, 50); // 각 글자 간의 지연 시간

      return () => clearInterval(intervalId);
    }
  }, [currentNode]);

  // 선택지 클릭 시 다음 노드로 이동
  const handleChoiceClick = (nextLevel, nextIndex) => {
    const nextNode = storyData.find(
      (node) => node.level === nextLevel && node.index === nextIndex
    );
    if (nextNode) {
      setCurrentNode(nextNode);
    } else {
      alert('다음 스토리가 없습니다.');
    }
  };

  return (
    <div style={styles.container}>
      {currentNode?.imageUrl && (
        <img src={`/story/${storyName}/${currentNode.imageUrl}`} alt="story scene" style={styles.backgroundImage} />
      )}
      <div style={styles.overlay}>
        <div style={styles.textContainer}>
          <p style={styles.storyText}>{displayText}</p>
        </div>
        {currentNode?.choices && currentNode?.choices.length > 0 ?
          isTextComplete && (
          <div style={styles.choicesContainer}>
            {currentNode.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceClick(choice.nextNodeLevel, choice.nextNodeIndex)}
                style={styles.choiceButton}
              >
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          <p style={styles.endText}>스토리가 종료되었습니다.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#000',
    zIndex: -2
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    zIndex: -1
  },
  overlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 이미지 위에 반투명 배경
    padding: '20px'
  },
  textContainer: {
    marginTop: '20px',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '8px',
    width: '80%'
  },
  storyText: {
    fontSize: '1.5em',
    lineHeight: '1.5em'
  },
  choicesContainer: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '1000px'
  },
  choiceButton: {
    padding: '15px',
    fontSize: '1.2em',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#eee',
    color: '#222',
    marginBottom: '10px',
    transition: 'background-color 0.3s',
    width: '100%'
  },
  endText: {
    fontSize: '1.5em',
    marginBottom: '20px'
  }
};

export default StoryViewer;