import { createChatBotMessage } from 'react-chatbot-kit';
import FileChooser from './FileChooserButton';

const botName = 'LACI';

const config = {
  initialMessages: [createChatBotMessage(`Hi! I'm ${botName}; I do not provide legal advice!`), 
                    createChatBotMessage(`Reply 'Help' for a list of commands. Otherwise, reply to my prompts.`)],
  widgets: [
    {
      widgetName: 'chooser',
      widgetFunc: (props) => <FileChooser {...props} />,
    },
  ],
  botName: botName,
  customStyles: {
    botMessageBox: {
      backgroundColor: '#376B7E',
    },
    chatButton: {
      backgroundColor: '#5ccc9d',
    },
  },
  affirm_words : ['yes', 'y', 'yeah', 'correct'],
  decline_words : ['no', 'n', 'nah', 'incorrect'],
  unsure_words : ['unsure', 'maybe', 'idk', 'm', 'skip'],
  cmd_words : ['help', 'threshold', 'reinit', 'reset', 'deps', 'info', 'information', 'explain',
              'prev', 'last', 'next', 'select', 'pick', 
              'debug_select', 'provide_licenses'],
  number_of_search_questions : 2,
  licenseCutOff : 2,
};


export default config;