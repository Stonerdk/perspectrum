import React from 'react';

interface BoldTextProps {
  text: string;
}

const BoldText: React.FC<BoldTextProps> = ({ text }) => {
  // 정규 표현식을 사용하여 **로 감싸진 텍스트를 찾습니다.
  const regex = /\*\*(.*?)\*\*/g;

  // 문자열을 **로 감싸진 부분과 그렇지 않은 부분으로 분리합니다.
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // 홀수 인덱스는 **로 감싸진 부분입니다.
        if (index % 2 === 1) {
          return <strong key={index}>{part}</strong>;
        }
        // 짝수 인덱스는 일반 텍스트입니다.
        return part;
      })}
    </>
  );
};

export default BoldText;