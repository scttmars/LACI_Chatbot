import React from "react";
import DialogManager from "./DialogManager";

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  // update the dialog manager's functions for creating messages and setting state
  DialogManager.setActionProviderFuncs(createChatBotMessage, setState);

  // Managing actions like this allows much better control of state
  const handleBinaryAnswer = DialogManager.handleBinaryAnswer;
  const handleCommand = DialogManager.handleCommand;
  const handleQuestionSelection = DialogManager.handleQuestionSelection;
  const handleArbitraryInput = DialogManager.handleArbitraryInput;

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: { handleBinaryAnswer, handleQuestionSelection, handleArbitraryInput, handleCommand },
        });
      })}
    </div>
  );
};

export default ActionProvider;