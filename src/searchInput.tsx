import React, { useCallback } from "react";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInputComponent: React.FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search personas..."
      value={value}
      onChange={onChange}
      style={{
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "5px",
        border: "none",
        outline: "none",
        width: "100%",
      }}
    />
  );
};

export const SearchInputMemo = React.memo(SearchInputComponent);