import React, { useState } from "react";
import styled from "styled-components";
import { Persona } from "./types";
import { PersonaName, PersonaIcon } from "./Components";

interface ModalProps {
  isOpen: boolean;
  personas: Persona[];
  participants: Persona[];
  onClose: () => void;
  onSelect: (persona: Persona) => void;
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

const PersonaList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
`;

const PersonaItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background: #3a3a3a;
  border-radius: 5px;
  gap: 10px;
  cursor: pointer;

  &:hover {
    background: #6c63ff;
  }
`;

const PersonaDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const PersonaRole = styled.span`
  color: #aaa;
  font-size: 14px;
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

const AddPersonaModal: React.FC<ModalProps> = ({ isOpen, personas, onClose, onSelect, participants }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPersonas = personas.filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    persona.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isParticipant = (persona: Persona) => participants.some(p => p.id === persona.id);

  return (
    <ModalContainer $isOpen={isOpen}>
      <ModalContent>
        <h2>Select Persona</h2>
        <input
          type="text"
          placeholder="Search by name or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <PersonaList>
          {filteredPersonas.map((persona) => (
            <PersonaItem
              key={persona.id}
              onClick={() => onSelect(persona)}
              style={{ opacity: isParticipant(persona) ? 0.5 : 1 }}
            >
              <PersonaIcon style={{ backgroundColor: persona.color }} />
              <PersonaDetails>
                <PersonaName>{persona.name}</PersonaName>
                <PersonaRole>{persona.role}</PersonaRole>
              </PersonaDetails>
            </PersonaItem>
          ))}
        </PersonaList>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default AddPersonaModal;