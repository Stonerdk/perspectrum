import React, { useEffect, useState, useCallback } from "react";
import {
  fetchMockedChatRoomHeaders,
  fetchMockedChatRoom,
  getPersonaById,
  fetchMockedPersonas,
  addChat,
  addPersona,
  modifyParticipants,
  addChatRoom,
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
  ToggleButton,
} from "./Components";
import { FaPaperPlane, FaPlus, FaUserPlus } from "react-icons/fa";

import {
  Persona,
  ChatMessage,
  ChatRoomHeader,
  ChatRoom,
  AvatarType,
} from "./types";
import GeneratePersonaModal from "./PersonaModal";
import Avatar from "avataaars";
import { BiSolidMessageAdd } from "react-icons/bi";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInputComponent: React.FC<SearchInputProps> = ({
  value,
  onChange,
}) => {
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
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [toggledPersonas, setToggledPersonas] = useState<Set<string>>(
    new Set()
  );

  // Loading/Styles
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [loadingParticipants, setLoadingParticipants] =
    useState<boolean>(false);
  const [isGeneratePersonaModalOpen, setGeneratePersonaModalOpen] =
    useState<boolean>(false);

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
    const fetchInitialData = async () => {
      const [personas, headers] = await Promise.all([
        fetchMockedPersonas(),
        fetchMockedChatRoomHeaders(),
      ]);
      setAllPersonas(personas);
      setChatRoomHeaders(headers);
      if (headers.length > 0) {
        selectChatRoom(headers[0].id, personas);
      }
    };
    fetchInitialData();
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
    modifyParticipants(
      currentChatRoom!.id,
      updatedParticipants.map((p) => p.id)
    ).then(() => {
      setParticipants(updatedParticipants);
      setIsAddingPersonas(false); // Exit persona adding mode
      setToggledPersonas((prev) => {
        const updatedSet = new Set(prev);
        updatedParticipants.forEach((p) => updatedSet.delete(p.id));
        return updatedSet;
      });
    });
  };

  useEffect(() => {
    setFilteredPersonas(
      allPersonas.filter((persona) =>
        persona.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [searchInput]);

  const selectChatRoom = async (id: string, personas?: Persona[]) => {
    setLoadingParticipants(true);
    const chatroom = await fetchMockedChatRoom(id);
    setCurrentChatRoom(chatroom);
    const participantIds = chatroom.participants;
    const participantsData = personas || allPersonas;
    const participants = participantIds
      .map((id) => participantsData.find((p) => p.id === id))
      .filter((p) => p !== undefined) as Persona[];
    setParticipants(participants);
    setSelectedPersonas(new Set(participantIds));
    setLoadingParticipants(false);
  };

  const handleToggle = (id: string) => {
    setToggledPersonas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // 토글 해제
      } else {
        newSet.add(id); // 토글 활성화
      }
      return newSet;
    });
  };

  const RightSidebar = () => {
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
      },
      []
    );
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Avatar
                          style={{ width: "40px", height: "40px" }}
                          avatarStyle="Circle"
                          {...persona.avatar}
                        />
                        <PersonaDetails>
                          <PersonaName>{persona.name}</PersonaName>
                          <PersonaRole>{persona.role}</PersonaRole>
                        </PersonaDetails>
                      </div>
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
                  <hr
                    style={{
                      width: "100%",
                      background: "#555",
                      height: "1px",
                      border: "0",
                    }}
                  />
                  <GenerateButton
                    style={{ alignSelf: "center" }}
                    onClick={() => setGeneratePersonaModalOpen(true)}
                  >
                    <FaPlus /> &nbsp; Generate New Persona
                  </GenerateButton>
                </FVFlex>
              </RightSidebarBody>
            ) : (
              <RightSidebarBody>
                <PersonasList>
                  {participants.map((persona) => (
                    <PersonaWrapper
                      key={persona.id}
                      onClick={() => handleToggle(persona.id)}
                      $isSelected={toggledPersonas.has(persona.id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Avatar
                          style={{ width: "40px", height: "40px", gap: "10px" }}
                          avatarStyle="Circle"
                          {...persona.avatar}
                        />
                        <PersonaDetails>
                          <PersonaName>{persona.name}</PersonaName>
                          <PersonaRole>{persona.role}</PersonaRole>
                        </PersonaDetails>
                      </div>
                      {/* 토글 버튼 */}
                      <ToggleButton
                        $isSelected={toggledPersonas.has(persona.id)}
                      >
                        @
                      </ToggleButton>
                    </PersonaWrapper>
                  ))}
                </PersonasList>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "right",
                  }}
                >
                  <NewPersonaButton onClick={() => setIsAddingPersonas(true)}>
                    <FaUserPlus />
                  </NewPersonaButton>
                </div>
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
            <PersonasList>
              {chatRoomHeaders.map((header) => (
                <ChatRoomHeaderItem
                  key={header.id}
                  onClick={() => selectChatRoom(header.id)}
                  $isSelected={currentChatRoom?.id === header.id}
                >
                  {header.recentMessage.message || "No recent message"}
                </ChatRoomHeaderItem>
              ))}
            </PersonasList>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "right",
              }}
            >
              <NewPersonaButton
                onClick={() => {
                  addChatRoom().then((chatroom) => {
                    fetchMockedChatRoomHeaders().then(
                      (headers: ChatRoomHeader[]) => {
                        setChatRoomHeaders(headers);
                      }
                    );
                    selectChatRoom(chatroom.id);
                    setGeneratePersonaModalOpen(false);
                  });
                }}
              >
                <BiSolidMessageAdd />
              </NewPersonaButton>
            </div>
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
                        <Avatar
                          style={{ width: "40px", height: "40px" }}
                          avatarStyle="Circle"
                          {...sender.avatar}
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
        onClose={() => {
          setGeneratePersonaModalOpen(false);
        }}
        onCreate={async (
          name: string,
          role: string,
          avatar: AvatarType,
          file: File
        ) => {
          await addPersona(name, role, avatar);
          const personas = await fetchMockedPersonas();
          setAllPersonas(personas);
          setFilteredPersonas(
            allPersonas.filter((persona) =>
              persona.name.toLowerCase().includes(searchInput.toLowerCase())
            )
          );
        }}
      />
    </Background>
  );
};

export default App;
