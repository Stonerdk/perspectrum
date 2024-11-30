import React, { useState } from "react";
import styled from "styled-components";
import { Persona, AvatarType } from "./types";
import { PersonaName, PersonaIcon, SendButton } from "./Components";
import Avatar from "avataaars";
import { generateRandomAvatar } from "./RandomAvatars";
import { FaDice } from "react-icons/fa";
import { faker } from "@faker-js/faker";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, role: string, avatar: AvatarType, file: File) => Promise<void>;
}

const ModalContainer = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
  z-index: 100;
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #4a4a4a;
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-height: 60%;
  overflow-y: auto;
  gap: 10px;
`;

const Input = styled.input`
  background: transparent;
  color: white;
  padding: 10px;
  border-radius: 0px;
  border: none;
  border-bottom: 1px solid #fff;
`;

const FileInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: none;
  color: #fff;
`;

const ConfirmButton = styled.button`
  background: #6c63ff;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  &:hover {
    background-color: #5a54d1;
  }
`;

const CloseButton = styled.button`
  width: 100%;
  background-color: #888888;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
`;

const PersonaInfoContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
`;

const PersonaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const GeneratePersonaModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [randomAvatar, setRandomAvatar] = useState<AvatarType>(
    generateRandomAvatar()
  );

  const handleCreate = async () => {
    if (name && role && file) {
      setName("");
      setRole("");
      setFile(null);
      await onCreate(name, role, randomAvatar, file);
      onClose();
    }
  };

  const handleClose = () => {
    setName("");
    setRole("");
    setFile(null);
    onClose();
  };
  return (
    <ModalContainer $isOpen={isOpen}>
      <ModalContent>

        <Header>
          <strong>Generate New Persona</strong>
          <SendButton
              onClick={() => {
                const av = generateRandomAvatar();
                console.log(av);
                setRandomAvatar(av);
                setName(faker.name.firstName());
              }}
            >
            <FaDice size={20} />
          </SendButton>
        </Header>
        <PersonaInfoContainer>
        <div style={{ position: "relative", display: "inline-block" }}>
            <Avatar
              style={{ width: "100px", height: "100px" }}
              avatarStyle="Circle"
              {...randomAvatar}
            />
          </div>

          <PersonaInfo>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Description"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </PersonaInfo>
        </PersonaInfoContainer>
        <FileInput
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
        {
          name && role && file ?
          <ConfirmButton onClick={handleCreate}>Create</ConfirmButton>
          :
          <CloseButton disabled>Create</CloseButton>
        }
        <CloseButton onClick={handleClose}>Close</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default GeneratePersonaModal;
