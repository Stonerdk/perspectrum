import styled, { keyframes } from "styled-components";
// 전체 화면 컨테이너

export const FHFlex = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
`
export const FVFlex = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`

export const Background = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  padding: 0;
`;

export const AppContainer = styled.div<{
  $leftSidebarOpen: boolean;
  $rightSidebarOpen: boolean;
}>`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 1368px;
  min-width: 1368px;
  max-height: 960px;
  margin-left: ${({ $leftSidebarOpen }) => ($leftSidebarOpen ? "250px" : "0")};
  margin-right: ${({ $rightSidebarOpen }) => ($rightSidebarOpen ? "250px" : "0")};
  padding: 0;
  transition: margin 0.3s ease;
`;

export const MainContent = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  transition: margin 0.3s ease;
`;


export const Navbar = styled.div`
  height: 60px;
  background-color: #4a4a4a;
  color: #fff;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export const NavbarButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: #6c63ff;
  }
`;

export const Sidebar = styled.div<{
  $isOpen: boolean;
  $position: "left" | "right";
}>`
  width: 200px;
  background-color: #242424;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  top: 0;
  bottom: 0;
  ${({ $position }) => $position}: ${({ $isOpen }) =>
    $isOpen ? "0" : "-250px"};
  transition: ${({ $position }) =>
    $position === "left" ? "transform 0.3s ease" : "transform 0.3s ease"};
  transform: ${({ $isOpen, $position }) =>
    $isOpen
      ? "translateX(0)"
      : $position === "left"
      ? "translateX(-250px)"
      : "translateX(250px)"};
  z-index: 10;
  overflow-y: hidden;
  padding: 10px;
`;

export const ChatArea = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 10px;
  background-color: #1e1e1e;
  overflow-y: hidden;
`;

export const CollapsibleSidebar = styled.div<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? "250px" : "40px")};
  background-color: #4a4a4a;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: ${({ $isOpen }) => ($isOpen ? "flex-start" : "center")};
  overflow: hidden;
`;

export const SidebarToggleButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  margin: 10px;
  font-size: 20px;
`;

export const ChatRoomHeaderItem = styled.div<{ $isSelected: boolean }>`
  padding-top: 10px;
  padding-bottom: 10px;
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#6c63ff" : "#242424"};
  color: #fff;
  cursor: pointer;
  width: 100%;
  border-radius: 5px;

  text-align: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5a54d1;
  }
`;

// 채팅창 래퍼
export const ChatWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1024px;
  height: 100%;
  max-height: 768px;
  background-color: #282828;
  border-radius: 10px;
  overflow: hidden;
`;

// Sidebar (사용자 목록
export const PersonaWrapper = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
  justify-content: space-between;
  background-color: ${({ $isSelected }) => ($isSelected ? "#6c63ff" : "#242424")};
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #3a3a3a;
  }
`;

export const PersonaIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`;

export const PersonaDetails = styled.div``;

export const PersonaName = styled.div`
  font-weight: bold;
  color: #fff;
`;

export const PersonaRole = styled.div`
  font-size: 13px;
  color: #fff;
`;

export const NewPersonaButton = styled.button`
  margin-top: auto;
  padding: 10px;
  background-color: #6c63ff;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
`;

export const RightSidebarBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
`

export const PersonasList = styled.div`
  display: flex;
  flex-direction: column;
`


export const PlusIcon = styled.div`
  font-size: 20px;
  line-height: 20px;
`;

export const Messages = styled.div`
  flex: 1;
  overflow-y: auto; /* 세로 스크롤은 가능 */
  scrollbar-width: none; /* Firefox에서 스크롤바 숨김 */
  -ms-overflow-style: none; /* Internet Explorer에서 스크롤바 숨김 */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari에서 스크롤바 숨김 */
  }
`;

export const MessageRow = styled.div<{ $ismine: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  flex-direction: ${({ $ismine }) => ($ismine ? "row-reverse" : "row")};
`;

export const MessageContent = styled.div<{ $ismine: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $ismine }) => ($ismine ? "flex-end" : "flex-start")};
`;

export const MessageText = styled.div<{ $ismine?: boolean }>`
  background-color: ${({ $ismine }) => ($ismine ? "#6c63ff" : "#222")};
  color: ${({ $ismine }) => ($ismine ? "#fff" : "#ccc")};
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 650px;
  border-top-right-radius: ${({ $ismine }) => ($ismine ? "0" : "10px")};
  border-top-left-radius: ${({ $ismine }) => ($ismine ? "10px" : "0")};
`;

export const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

export const MessageSender = styled.div`
  font-weight: bold;
  color: #ddd;
`;

export const MessageRole = styled.div`

  font-size: 12px;
  color: #ddd;
`;

export const ChatActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 10px;
`;

export const QuestionButton = styled.button`
  background-color: #6c63ff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

export const InputArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Input = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: none;
  outline: none;
`;

export const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #6c63ff;
  color: #fff;
  border: none;
  border-radius: 50%;
  padding: 0;
  width: 40px;
  height: 40px;
  cursor: pointer;
  &:hover {
      background-color: #5a54d1;
  }
`;

export const SearchInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: none;
  outline: none;
`;

export const CommitButton = styled.button`
  width: 100%;
  background-color: #6c63ff;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  &:hover {
    background-color: #5a54d1;
  }
`;

export const ContinueButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
`

export const CancelButton = styled.button`
  width: 100%;
  max-width: 150px;
  background-color: #888888;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  &:hover {
    background-color: #aaaaaa;
  }
`;

export const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 300px;
  background-color: #6c63ff;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  &:hover {
    background-color: #5a54d1;
  }
`;

export const ToggleButton = styled.button<{ $isSelected: boolean }>`
  background-color: transparent;
  color: ${({ $isSelected }) => ($isSelected ? "#ffffff" : "#242424")};
  border: 0px solid #aaa;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  font-size: 24px;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1); /* 바깥 원 */
  border-left-color: #4a90e2; /* 회전하는 원 */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin: auto; /* 가운데 정렬 */
`;