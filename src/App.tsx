import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaAngleDoubleDown,
  FaPaperPlane,
  FaStop,
  FaUserPlus,
} from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import {
  retrieveChat,
  addChatRoom,
  fetchMockedChatRoom,
  fetchMockedChatRoomHeaders,
  fetchMockedPersonas,
  modifyParticipants,
  retrieveRecommendedPersona,
  cancelChat,
  debateChat,
  resetChat,
  sendChat,
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
  MessageRole,
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
import BoldText from "./BoldText";

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

const App: React.FC = () => {
  // API
  const [chatRoomHeaders, setChatRoomHeaders] = useState<ChatRoomHeader[]>([]);
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [participants, setParticipants] = useState<Persona[]>([]);
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);
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
            console.log("Conversation ended");
          } else if (message.system == "cancel") {
            console.log("Conversation canceled");
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

    try {
      await sendChat(currentChatRoom.id, "0", messageInput);
    } catch (e) {
      console.error(e);
      setGenerating(false);
      return;
    }

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
      await retrieveChat(currentChatRoom.id);
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
      await debateChat(currentChatRoom!.id);
    } catch (e) {
      console.error(e);
      setGenerating(false);
    }
  };

  const cancelMessage = async () => {
    if (currentChatRoom) {
      await cancelChat(currentChatRoom.id);
      setGenerating(false);
    }
  };

  const resetMessage = async () => {
    if (currentChatRoom) {
      await resetChat(currentChatRoom.id);
      setGenerating(false);
      setShowContinue(false);
    }
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

  useEffect(() => {
    setSelectedPersonas(new Set(participants.map(({ id }) => id)));
  }, [participants]);

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
    return (
      <Sidebar $isOpen={true} $position="right">
        {(loadingParticipants || recommending)? (
          <div style={{ display: "flex", justifyContent: "center", width: "100%", height: "40%"}}>
            <ClipLoader
              color="#fff"
              loading={true}
              size={20}
              cssOverride={{
                marginLeft: "30px",
                marginRight: "30px",
              }}
            />
          </div>
        ) : (
          <>
            {isAddingPersonas ? (
              <RightSidebarBody>
                <PersonasList>
                  {allPersonas.map((persona) => (
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
                          <PersonaRole>{capitalizeFirstLetter(persona.role)}</PersonaRole>
                        </PersonaDetails>
                      </div>
                    </PersonaWrapper>
                  ))}
                </PersonasList>
                <FVFlex>
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
                          <PersonaRole>{capitalizeFirstLetter(persona.role)}</PersonaRole>
                        </PersonaDetails>
                      </div>
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
                  {(header.recentMessage?.message.length??0) > 20
                  ? `${header.recentMessage?.message.slice(0, 20)}...`
                  : header.recentMessage?.message ?? "No recent message"}
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
                            <>
                              <MessageSender>{sender.name}</MessageSender>
                              <MessageRole>{capitalizeFirstLetter(sender.role)}</MessageRole>
                            </>
                          )}
                          <MessageText $ismine={isMine}>
                            {message.message === "..." && !isMine ? (
                              <ClipLoader
                                color="#fff"
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
                                  <BoldText text={line} />
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
                        <FaAngleDoubleDown />
                        &nbsp;&nbsp;
                        <strong>Go Deeper!</strong>
                      </GenerateButton>
                      <CancelButton onClick={resetMessage}>Cancel</CancelButton>
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
