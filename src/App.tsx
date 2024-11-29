import React, { useEffect, useState, useCallback } from "react";
import {
  fetchMockedChatRoomHeaders,
  fetchMockedChatRoom,
  getPersonaById,
  fetchMockedPersonas,
  addChat,
} from "./apiMock";
import {
  Background,
  AppContainer,
  Navbar,
  NavbarButton,
  MainContent,
  Sidebar,
  ChatRoomHeaderItem,
  ChatWrapper,
  PersonaWrapper,
  PersonaIcon,
  PersonaDetails,
  PersonaName,
  PersonaRole,
  NewPersonaButton,
  PlusIcon,
  ChatArea,
  Messages,
  MessageRow,
  MessageAvatar,
  MessageContent,
  MessageSender,
  MessageText,
  InputArea,
  Input,
  SendButton,
  PersonasList,
  RightSidebarBody,
  SearchInput,
  CommitButton,
  FHFlex,
  FVFlex,
  CancelButton,
  GenerateButton,
} from "./Components";
import { FaPaperPlane, FaPlus, FaUserPlus } from "react-icons/fa";

import { Persona, ChatMessage, ChatRoomHeader, ChatRoom } from "./types";
import GeneratePersonaModal from "./PersonaModal";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInputComponent: React.FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <SearchInput
      type="text"
      placeholder="Search personas..."
      value={value}
      onChange={onChange}
    />
  );
};

const SearchInputMemo = React.memo(SearchInputComponent);

const App: React.FC = () => {
  // API
  const [chatRoomHeaders, setChatRoomHeaders] = useState<ChatRoomHeader[]>([]);
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [participants, setParticipants] = useState<Persona[]>([]);
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);

  // Loading/Styles
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [loadingParticipants, setLoadingParticipants] =
    useState<boolean>(false);
  const [isGeneratePersonaModalOpen, setGeneratePersonaModalOpen] = useState<boolean>(false);

  // INPUT
  const [messageInput, setMessageInput] = useState<string>("");

  // Invite
  const [searchInput, setSearchInput] = useState<string>("");
  const [isAddingPersonas, setIsAddingPersonas] = useState<boolean>(false);
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(
    new Set()
  );

  const sendMessage = async () => {
    if (!currentChatRoom || messageInput.trim() === "") return;
    await addChat(currentChatRoom.id, "0", messageInput);
    fetchMockedChatRoom(currentChatRoom.id).then((chatroom: ChatRoom) => {
      setCurrentChatRoom(chatroom);
    });
    setMessageInput(""); // 입력창 초기화
  };

  useEffect(() => {
    fetchMockedPersonas().then(setAllPersonas);
  }, []);

  useEffect(() => {
    fetchMockedChatRoomHeaders().then((headers: ChatRoomHeader[]) => {
      setChatRoomHeaders(headers);
      if (headers.length > 0) {
        selectChatRoom(headers[0].id);
      }
    });
  }, []);

  const togglePersonaParticipation = (id: string) => {
    setSelectedPersonas((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const applyPersonaChanges = () => {
    const updatedParticipants = allPersonas.filter((persona) =>
      selectedPersonas.has(persona.id)
    );
    setParticipants(updatedParticipants);
    setIsAddingPersonas(false); // Exit persona adding mode
  };

  const filteredPersonas = allPersonas.filter((persona) =>
    persona.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const selectChatRoom = (id: string) => {
    setLoadingParticipants(true);
    fetchMockedChatRoom(id).then((chatroom) => {
      setCurrentChatRoom(chatroom);
      const promises = chatroom.participants.map((id) => getPersonaById(id));
      Promise.all(promises).then((personas) => {
        setParticipants(personas.filter((p) => p !== undefined) as Persona[]);
        setSelectedPersonas(new Set(chatroom.participants));
        setLoadingParticipants(false);
      });
    });
  };


  const RightSidebar = () => {
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    }, [])
    return (
      <Sidebar $isOpen={isRightSidebarOpen} $position="right">
        {loadingParticipants ? (
          <div>Loading participants...</div>
        ) : (
          <>
            {isAddingPersonas ? (
              <RightSidebarBody>
                <PersonasList>
                  {filteredPersonas.map((persona) => (
                    <PersonaWrapper
                      key={persona.id}
                      onClick={() => togglePersonaParticipation(persona.id)}
                      $isSelected={selectedPersonas.has(persona.id)}
                    >
                      <PersonaIcon style={{ backgroundColor: persona.color }} />
                      <PersonaDetails>
                        <PersonaName>{persona.name}</PersonaName>
                        <PersonaRole>{persona.role}</PersonaRole>
                      </PersonaDetails>
                    </PersonaWrapper>
                  ))}
                </PersonasList>
                <FVFlex>

                  {/* <SearchInputMemo
                    value={searchInput}
                    onChange={handleSearchChange}
                  /> */}
                  <FHFlex>
                    <CommitButton onClick={applyPersonaChanges}>
                      Confirm
                    </CommitButton>
                    <CancelButton onClick={() => setIsAddingPersonas(false)}>
                      Cancel
                    </CancelButton>
                  </FHFlex>
                  <hr style={{width:"100%", background: "#555", height: "1px", border: "0" }} />
                    <GenerateButton style={{ alignSelf: "center" }} onClick={() => {
                      setGeneratePersonaModalOpen(true);
                    }}>
                    <FaPlus /> &nbsp; Generate New Persona
                    </GenerateButton>
                </FVFlex>
              </RightSidebarBody>
            ) : (
              <RightSidebarBody>
                <PersonasList>
                  {participants.map((persona) => (
                    <PersonaWrapper key={persona.id}>
                      <PersonaIcon style={{ backgroundColor: persona.color }} />
                      <PersonaDetails>
                        <PersonaName>{persona.name}</PersonaName>
                        <PersonaRole>{persona.role}</PersonaRole>
                      </PersonaDetails>
                    </PersonaWrapper>
                  ))}
                </PersonasList>
                <NewPersonaButton onClick={() => setIsAddingPersonas(true)}>
                  <FaUserPlus />
                </NewPersonaButton>
              </RightSidebarBody>
            )}
          </>
        )}
      </Sidebar>
    );
  };

  return (
    <Background>
      {/* Navbar */}
      <AppContainer
        $leftSidebarOpen={isLeftSidebarOpen}
        $rightSidebarOpen={isRightSidebarOpen}
      >
        {/* Main Content */}
        <MainContent>
          {/* Left Sidebar */}
          <Sidebar $isOpen={isLeftSidebarOpen} $position="left">
            {chatRoomHeaders.map((header) => (
              <ChatRoomHeaderItem
                key={header.id}
                onClick={() => selectChatRoom(header.id)}
                $isSelected={currentChatRoom?.id === header.id}
              >
                {header.recentMessage.message || "No recent message"}
              </ChatRoomHeaderItem>
            ))}
          </Sidebar>

          {/* Chat Area */}
          <ChatArea>
            <Messages>
              {currentChatRoom &&
                currentChatRoom.messages.map((message, idx) => {
                  const sender = participants.find(
                    (p) => p.id === message.sender
                  );
                  const isMine = message.sender === "0";
                  return (
                    <MessageRow key={idx} $ismine={isMine}>
                      {!isMine && sender && (
                        <MessageAvatar
                          style={{ backgroundColor: sender.color }}
                        />
                      )}
                      <MessageContent $ismine={isMine}>
                        {!isMine && sender && (
                          <MessageSender>{sender.name}</MessageSender>
                        )}
                        <MessageText $ismine={isMine}>
                          {message.message}
                        </MessageText>
                      </MessageContent>
                    </MessageRow>
                  );
                })}
            </Messages>
            <InputArea>
              <Input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <SendButton onClick={sendMessage}>
                <FaPaperPlane size={16} />
              </SendButton>
            </InputArea>
          </ChatArea>

          {/* Right Sidebar */}
          <RightSidebar />
        </MainContent>
      </AppContainer>
      <GeneratePersonaModal
        isOpen={isGeneratePersonaModalOpen}
        onClose={() => {setGeneratePersonaModalOpen(false)}}
        onCreate={() => {}} />
    </Background>
  );
};

export default App;
