import React, { useState } from "react";
import styled from "styled-components";
import { Persona } from "./types";
import { PersonaName, PersonaIcon } from "./Components";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (persona: { name: string; role: string; file: File }) => void;
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
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: none;
`;

const FileInput = styled.input`
  margin-bottom: 10px;
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
`;

const CloseButton = styled.button`
  background: #6c63ff;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
`;

const GeneratePersonaModal: React.FC<ModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleCreate = () => {
    if (name && role && file) {
      onCreate({ name, role, file });
      setName("");
      setRole("");
      setFile(null);
      onClose();
    }
  };

  return (
    <ModalContainer $isOpen={isOpen}>
      <ModalContent>
        <h2>Create New Persona</h2>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <FileInput
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
        <ConfirmButton onClick={handleCreate}>Create</ConfirmButton>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default GeneratePersonaModal;