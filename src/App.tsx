import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaStop, FaUserPlus } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import {
  addChat,
  addChatRoom,
  fetchMockedChatRoom,
  fetchMockedChatRoomHeaders,
  fetchMockedPersonas,
  modifyParticipants,
  retrieveRecommendedPersona,
  cancelChat,
  continueChat,
} from "./api";
import {
  AppContainer,
  Background,
  CancelButton,
  ChatArea,
  ChatRoomHeaderItem,
  CommitButton,
  ContinueButtonWrapper,
  FHFlex,
  FVFlex,
  GenerateButton,
  Input,
  InputArea,
  MainContent,
  MessageContent,
  MessageRow,
  Messages,
  MessageSender,
  MessageText,
  NewPersonaButton,
  PersonaDetails,
  PersonaName,
  PersonaRole,
  PersonasList,
  PersonaWrapper,
  RightSidebarBody,
  SearchInput,
  SendButton,
  Sidebar,
  ToggleButton,
} from "./Components";

import Avatar from "avataaars";
import { BiSolidMessageAdd } from "react-icons/bi";
import {
  ChatMessage,
  ChatRoom,
  ChatRoomHeader,
  Persona,
  SystemMessage,
} from "./types";
import { GiDiscussion } from "react-icons/gi";

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
  const [loadingParticipants, setLoadingParticipants] =
    useState<boolean>(false);
  useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [recommending, setRecommending] = useState<boolean>(false);
  const [showContinue, setShowContinue] = useState<boolean>(false);

  // INPUT
  const [messageInput, setMessageInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Invite
  const [searchInput, setSearchInput] = useState<string>("");
  const [isAddingPersonas, setIsAddingPersonas] = useState<boolean>(false);
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(
    new Set()
  );

  const chatRoomRef = useRef<HTMLDivElement | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (currentChatRoom) {
      setMessages(currentChatRoom.messages);
      websocket.current = new WebSocket(
        `ws://localhost:8000/ws/chatrooms/${currentChatRoom.id}`
      );
      websocket.current.onopen = () => {
        console.log("WebSocket 연결 성공");
      };

      websocket.current.onmessage = (event) => {
        const message: ChatMessage | SystemMessage = JSON.parse(event.data);
        if ("system" in message) {
          if (message.system == "continue") {
            setShowContinue(true);
            setGenerating(false);
          } else if (message.system == "end") {
            setGenerating(false);
            console.log("Conversation ended")
          } else if (message.system == "cancel") {
            console.log("Conversation canceled")
          } else if (message.system == "error") {
            console.error("An error occuring from the system", message.aux);
          } else {
            console.error(
              "Invalid system message recieved from backend",
              message
            );
          }
        } else if ("sender" in message) {
          setMessages((prevMessages) => {
            const index = prevMessages.findIndex(
              (msg) => msg.id === message.id
            );
            if (index !== -1) {
              const updatedMessages = [...prevMessages];
              updatedMessages[index] = message;
              return updatedMessages;
            } else {
              return [...prevMessages, message];
            }
          });
        } else {
          console.error("Invalid message recieved from backend", message);
        }
      };

      websocket.current.onclose = () => {
        setGenerating(false);
        console.log("WebSocket 연결 종료");
      };

      return () => {
        setGenerating(false);
        websocket.current?.close();
      };
    }
  }, [currentChatRoom]);

  useEffect(() => {
    chatRoomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const sendMessage = async () => {
    if (!currentChatRoom || messageInput.trim() === "") return;
    setShowContinue(false);
    setMessageInput("");
    setGenerating(true);
    setRecommending(true);
    try {
      const recommendedParticipants = await retrieveRecommendedPersona(
        currentChatRoom.id,
        messageInput
      );
      setParticipants(recommendedParticipants);
    } catch (e) {
      console.error(e);
      setRecommending(false);
      setGenerating(false);
      return;
    }
    setRecommending(false);

    try {
      await addChat(currentChatRoom.id, "0", messageInput);
    } catch (e) {
      console.error(e);
      setGenerating(false);
    }
    // fetchMockedChatRoom(currentChatRoom.id).then((chatroom: ChatRoom) => {
    //   setCurrentChatRoom(chatroom);
    // });
  };

  const continueMessage = async () => {
    setShowContinue(false);
    setGenerating(true);
    try {
      await continueChat(currentChatRoom!.id);
    } catch (e) {
      console.error(e);
      setGenerating(false);
    }
  }

  const cancelMessage = async () => {
    if (currentChatRoom) {
      await cancelChat(currentChatRoom.id);
      setGenerating(true);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const [personas, headers] = await Promise.all([
        fetchMockedPersonas(),
        fetchMockedChatRoomHeaders(),
      ]);
      setAllPersonas(personas);
      setFilteredPersonas(
        personas.filter((persona) =>
          persona.name.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
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
      <Sidebar $isOpen={true} $position="right">
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
      <AppContainer $leftSidebarOpen={true} $rightSidebarOpen={true}>
        {/* Main Content */}
        <MainContent>
          {/* Left Sidebar */}
          <Sidebar $isOpen={true} $position="left">
            <PersonasList>
              {chatRoomHeaders.map((header) => (
                <ChatRoomHeaderItem
                  key={header.id}
                  onClick={() => selectChatRoom(header.id)}
                  $isSelected={currentChatRoom?.id === header.id}
                >
                  {header.recentMessage?.message.slice(0, 30) ??
                    "No recent message"}
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
                  });
                }}
              >
                <BiSolidMessageAdd />
              </NewPersonaButton>
            </div>
          </Sidebar>
          <ChatArea>
            <Messages>
              {currentChatRoom && (
                <>
                  {messages.map((message, idx) => {
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
                            {message.message === "..." && !isMine ? (
                              <ClipLoader
                                color="#000"
                                loading={true}
                                size={20}
                                cssOverride={{
                                  marginLeft: "30px",
                                  marginRight: "30px",
                                }}
                              />
                            ) : (
                              message.message.split("\n").map((line, index) => (
                                <React.Fragment key={index}>
                                  {line}
                                  <br />
                                </React.Fragment>
                              ))
                            )}
                          </MessageText>
                        </MessageContent>
                      </MessageRow>
                    );
                  })}
                  {showContinue && (
                    <ContinueButtonWrapper>
                      <GenerateButton onClick={continueMessage}>
                        <GiDiscussion />&nbsp;&nbsp;
                        <strong>Go Deeper!</strong>
                      </GenerateButton>
                      <CancelButton>Cacnel</CancelButton>
                    </ContinueButtonWrapper>
                  )}
                </>
              )}
              <div ref={chatRoomRef} />
            </Messages>
            <InputArea>
              <Input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={!currentChatRoom || generating}
              />
              {generating ? (
                <SendButton onClick={cancelMessage}>
                  <FaStop size={16} />
                </SendButton>
              ) : (
                <SendButton onClick={sendMessage}>
                  <FaPaperPlane size={16} />
                </SendButton>
              )}
            </InputArea>
          </ChatArea>
          <RightSidebar />
        </MainContent>
      </AppContainer>
    </Background>
  );
};

export default App;
