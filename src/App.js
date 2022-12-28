import React from "react";
import Chatbot from "react-chatbot-kit";

import config from './bot/config_cb';
import MessageParser from './bot/message_parser';
import ActionProvider from './bot/action_provider';


function App() {
  return (
    <div className="App">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
}

export default App;