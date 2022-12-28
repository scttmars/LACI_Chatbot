import React from 'react';
import config from './config_cb';

/**
 * Message parser for the chatbot, decides what type of response it gets and how should be handled
 */
const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    // Lambdas for affirm and deny words
    const is_affirm = (word) => config.affirm_words.includes(word);
    const is_decline = (word) => config.decline_words.includes(word);
    const is_unsure = (word) => config.unsure_words.includes(word);
    const is_cmd = (word) => config.cmd_words.includes(word);

    // SPLIT BY SEPERATOR CHARACTERS
    const msg_arr = message.toLowerCase().split(/[,.\s;:"'`]+/g);
    console.log(msg_arr);

    // CONFIRM (uses confirmation words specifed in config_cb.js)
    if (msg_arr.some(is_affirm)) {
      actions.handleBinaryAnswer(message, msg_arr, 'Y');
      return;
    }
    // DENY (uses decline words specifed in config_cb.js)
    if (msg_arr.some(is_decline)) {
      actions.handleBinaryAnswer(message, msg_arr, 'N');
      return;
    }
    // UNCRETAIN (uses maybe words specified in config_cb.js)
    if (msg_arr.some(is_unsure)) {
      actions.handleBinaryAnswer(message, msg_arr, 'M');
      return;
    }
    // COMMAND
    if (is_cmd(msg_arr[0])) {
      actions.handleCommand(message, msg_arr, msg_arr[0]);
      return;
    }

    // SELECTION FROM KEYWORDS 
    if (msg_arr.length === 1) {
      const ind = parseInt(msg_arr[0]);
      if (!isNaN(ind)) {
        actions.handleQuestionSelection(message, msg_arr, ind);
        return;
      }
    }
    // NO OTHER ACTION DETECTED, USE KEYWORD ANALYSIS
    actions.handleArbitraryInput(message, msg_arr);

  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions: {},
        });
      })}
    </div>
  );
};

export default MessageParser;