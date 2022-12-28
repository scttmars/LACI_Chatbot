import { Question } from "./data_classes/Question";
import BEInterface from "./BackEndInterface";
import config from "./config_cb"

/**
 * Handle how user responses are handled based on the current state.
 */
class DialogManagerClass {
  /**
   * 
   * @param {BackEndInterface} backendInterface 
   */
  constructor(backendInterface) {
    this.backendInterface = backendInterface;
    
    this.question = new Question(1, "This is a starting Question?", 0, "NOTHING");

    this.searchQuestions = [];
    this.searchKeywords = [];

    // ensures that the this context for the below object is DialogManager
    const par_this = this;
    // Define polymorphic states and their actions
    this.DialogStates = {
      // The initial starting state
      INIT : { 
        state : "INIT",
        respondToBinaryAnswer : (m, a, an) => {},
        respondToCommand : (m, a, an) => {},
        respondToQuestionSelect : (m, a, an) => {},
        respondToArbitraryAnswer : (m, a) => {}
      },
      // State to handle the user specifying a project path
      PROJECT_LOCATION_INIT : { 
        state : "PROJECT_LOCATION_INIT",
        respondToBinaryAnswer : (m, a, an) => {},
        respondToCommand : (m, a, an) => par_this.GEN_respondToCommand(m, a, an),
        respondToQuestionSelect : (m, a, an) => {},
        respondToArbitraryAnswer : (m, a) => par_this.PL_INIT_respondToArbitraryAnswer(m, a)
      },
      // State to handle the user answering questions
      QUESTIONS : { 
        state : "QUESTIONS",
        respondToBinaryAnswer : (m, a, an) => par_this.QUESTION_respondToBinaryAnswer(m, a, an),
        respondToCommand : (m, a, an) => par_this.GEN_respondToCommand(m, a, an),
        respondToQuestionSelect : (m, a, an) => {},
        respondToArbitraryAnswer : (m, a) => par_this.QUESTION_respondToArbitraryAnswer(m, a)
      },
      // State to list possible licenses based on the dependencies and answers
      LISTINGS : { 
        state : "LISTINGS",
        respondToBinaryAnswer : (m, a, an) => par_this.outputSimpleMessage("Now is not the time for this response."),
        respondToCommand : (m, a, an) => par_this.LISTINGS_respondToCommand(m, a, an),
        respondToQuestionSelect : (m, a, an) => par_this.outputSimpleMessage("Now is not the time for this response."),
        respondToArbitraryAnswer : (m, a) => par_this.outputSimpleMessage("Now is not the time for this response.")
      },
      // State to allow the user to select a question, based on the question prompt they asked for
      KEYWORD_SEARCH : { 
        state : "KEYWORD_SEARCH",
        respondToBinaryAnswer : (m, a, an) => par_this.outputSimpleMessage("Now is not the time for this response."),
        respondToCommand : (m, a, an) => par_this.outputSimpleMessage("Now is not the time for this response."),
        respondToQuestionSelect : (m, a, ind) => par_this.KEYW_respondToQuestionSelect(m, a, ind),
        respondToArbitraryAnswer : (m, a) => par_this.outputSimpleMessage("Now is not the time for this response.")
      },
      // UNUSED state to inform the user of new dependencies conflicting with their 
      INFORM_DEPEND_ANSWER_CONFLICT : {
        state : "INFORM_DEPEND_ANSWER_CONFLICT",
        respondToBinaryAnswer : (m, a, an) => par_this.outputSimpleMessage("Now is not the time for this response."),
        respondToCommand : (m, a, an) => par_this.outputSimpleMessage("Now is not the time for this response."),
        respondToQuestionSelect : (m, a, ind) => par_this.outputSimpleMessage("Now is not the time for this response."),
        respondToArbitraryAnswer : (m, a) => par_this.outputSimpleMessage("Now is not the time for this response.")
      }, 
      // State to let the player fix dependency dependency conflicts then continue by command
      INFORM_DEPEND_DEPEND_CONFLICT : {
        state : "INFORM_DEPEND_DEPEND_CONFLICT",
        respondToBinaryAnswer : (m, a, an) => {},
        respondToCommand : (m, a, an) => par_this.GEN_respondToCommand(m, a, an),
        respondToQuestionSelect : (m, a, ind) => {},
        respondToArbitraryAnswer : (m, a) => {}
      }, 
      // Final state, allow player to reinit and reset, get info on their license
      FINAL : {
        state : "FINAL",
        respondToBinaryAnswer : (m, a, an) => {},
        respondToCommand : (m, a, an) => par_this.FINAL_respondToCommand(m, a, an),
        respondToQuestionSelect : (m, a, ind) => {},
        respondToArbitraryAnswer : (m, a) => {}
      },
      // DEBUG state, set the threshold for license count to transition to listings (prompted by 'set_license')
      SET_THRESHOLD : {
        state : "SET_THRESHOLD",
        respondToBinaryAnswer : (m, a, an) => {},
        respondToCommand : (m, a, an) => {},
        respondToQuestionSelect : (m, a, ind) => par_this.SET_THRESHOLD_setThreshold(m, a, ind),
        respondToArbitraryAnswer : (m, a) => {}
      },
      // Do nothing until a response from the backend is received. A DO NOTHING state.
      WAIT : {
        state : "WAIT",
        respondToBinaryAnswer : (m, a, an) => {},
        respondToCommand : (m, a, an) => {},
        respondToQuestionSelect : (m, a, ind) => {},
        respondToArbitraryAnswer : (m, a) => {}

      }
    };

    this.state = this.DialogStates.INIT;
  }
  /*******************************************************************
   * *******     ACTION PROVIDER LAMBDAS (USED BY PARSER)      *******
   * ****************************************************************/

  // Handle binary answers (Y/N)
  handleBinaryAnswer = (message, msg_arr, answer) => {
    this.state.respondToBinaryAnswer(message, msg_arr, answer);
  };
  // Handle special commands
  handleCommand = (message, msg_arr, command) => {
    this.state.respondToCommand(message, msg_arr, command);
  };
  // Handle number input, used for selecting questions
  handleQuestionSelection = (message, msg_arr, ind) => {
    this.state.respondToQuestionSelect(message, msg_arr, ind);
  };
  // Handle arbitrary input (not a command, nor number, nor binary answer)
  handleArbitraryInput = (message, keywords) => {
    this.state.respondToArbitraryAnswer(message, keywords);
  };







//#region INIT FUNCTIONS

  // Set by ActionProvider anytime it is re-constructed, (this happens very frequently)
  setActionProviderFuncs(createMessageFunc, setStateFunc) {
    this.createMessage = createMessageFunc;
    this.setState = setStateFunc;

    
    if (this.state.state === this.DialogStates.INIT.state) {
        this.state = this.DialogStates.WAIT;
        this.backendInterface.makeProjectRequest()
          .then((hasValidProject) => {
            if (!hasValidProject) {
              this.PL_INIT_askProjectLocation("Please provide a path to the directory of your project's maven file...");
            } else {
              if (this.backendInterface.getSelectedLicense() == undefined || this.backendInterface.getSelectedLicense() == "") {
                this.state = this.DialogStates.WAIT;
                this.outputSimpleMessage("Checking your dependencies. This may take a while...");
                this.backendInterface.reinitDependencyChecker()
                  .then(response => this.INIT_handleProjectResolution());
              } else {
                this.transitionToFinalState();
              }
            }
          });
    }
  }

  /**
   * Ask the user for the project path.
   * 
   * @param {String} msg First informative message to send to user.
   */
  PL_INIT_askProjectLocation(msg) {
    this.state = this.DialogStates.PROJECT_LOCATION_INIT;
    this.outputSimpleMessage(msg);
    this.outputWidgetMessage("The path must be provided via a reply; you may click here to open a file explorer (copy/paste the path).", 'chooser');
  }

  /**
   * Get the conflicts for the project.
   * SENDS TO BACKEND, VERY SLOW!!!
   */
  getConflicts() {
    this.backendInterface.getDependencyConflicts()
      .then(response => this.outputSimpleMessage(JSON.stringify(response)));
  }

  /**
   * Output data by chatbot reply on the most visible dependencies with licenses that may cause conflicts
   */
  INIT_displayDependencyData() {
    // PARSING
    let deps = this.backendInterface.getDependencies();
    let compats = { "GPL" : new Set(), "Apache" : new Set(), "BSD": new Set() };
    for (let key in deps) {
      let type = deps[key];
      for (let dep of type) {
        for (let lic of dep['licenses']) {
          for (let c in compats) {
            if (lic['name'].includes(c)) {
              compats[c].add(dep['groupID']);
            }
          }
        }
      }
    }
    
    // OUTPUT
    console.log(compats);
    let req = false;
    for (let lic in compats) {
      let deps = compats[lic];
      if (deps.size > 0) {
        this.outputSimpleMessage("Your project has dependencies with a " + lic + " license: " + Array.from(deps));
        req = true;
      }
    }

    if (req) {
      this.outputSimpleMessage("Your project's license will need to be compatiable.");
    } else {
      this.outputSimpleMessage("Your project has no dependencies which cause compatiability restrictions visible to me.")
    }
  }

  /**
   * Checks for conflicts, whether a license is selected, or whether to transition to license listing.
   * A fork-in-the-road method.
   * 
   * ASSUMES THAT THE RULE SET MANAGER HAS BEEN PROVIDED AN UP-TO-DATE COPY OF CONFLICTS
   *    makeProjectRequest() ensures this and should be called before this method
   */
  INIT_handleProjectResolution() {
    
    console.log("Attempting conflict resolve/startup");
    
    const conflicts = this.backendInterface.conflicts;
    if (conflicts.length > 0) {
      this.transitionToDDConflictResolve(conflicts[0]);
    } else if (this.backendInterface.getSelectedLicense() != undefined && this.backendInterface.getSelectedLicense() != "") {
      this.outputSimpleMessage("Your license is " + this.backendInterface.getSelectedLicense());
      this.transitionToFinalState();
    } else if (this.shouldTransitionToListings()) {
      this.transitionToListings();
    } else {
      // this.INIT_displayDependencyData();
      this.askQuestion();
    }
  }


  /**
   * Takes a response from user and sends it as a path to the backend to load a project
   * 
   * @param {str} msg - either 'chooser' or a path 
   * @param {*} arr - unused
   */
  PL_INIT_respondToArbitraryAnswer(msg, arr) {
    // Upon response from server, either switch to handling server or inform user of failure
    this.state = this.DialogStates.WAIT;
    this.outputSimpleMessage("Attempting to load your dependencies. This may take a while...");
    this.backendInterface.setProjectPath(msg.trim())
      .then((hasValidProject) => {
        if (hasValidProject) {
          this.backendInterface.getDependencyConflicts()
            .then(response => this.INIT_handleProjectResolution());
        } else {
          this.PL_INIT_askProjectLocation("I could not find a maven file there...");
        }
      });
  }

//#endregion INIT FUNCTIONS



//#region QUESTIONS

  /**
   * At the QUESTION state,
   * Handle binary response to a question.
   * 
   * @param {*} msg 
   * @param {*} msg_arr 
   * @param {*} answer 
   */
  QUESTION_respondToBinaryAnswer(msg, msg_arr, answer) {
    this.state = this.DialogStates.WAIT;

    // On response from server, determine if we should display licenses or continue questions
    this.backendInterface.answerQuestion(this.question.id, answer)
      .then((successfulAnswer) => {
        if (!successfulAnswer) {
          this.PL_INIT_askProjectLocation("I have lost the Maven file. Can you specify it again?");
        }
        else if (this.shouldTransitionToListings()) {
          this.transitionToListings();
        } else {
          this.askQuestion();
        }
      });
  }


  /**
   * At the QUESTION state,
   * from an arbitrary (non-binary) response, select questions to prompt the user with.
   * 
   * @param {*} msg 
   * @param {*} keywords 
   */
  QUESTION_respondToArbitraryAnswer(msg, keywords) {

    const debugMessage = this.createMessage(`You appeared to have tried to ask a question, but I cannot understand. Please select a related question.`);

    const searchQuestions = this.searchQuestionsByKeywords(keywords);
    searchQuestions.length = Math.min(config.number_of_search_questions, searchQuestions.length);
    const questionStrs = searchQuestions.map(q => q.toString());
    const inputMessage = this.createMessage(`Questions to select (reply with 0, 1, or 2):`);
    const messages = [debugMessage, inputMessage];
    for (var i = 0; i < searchQuestions.length; ++i) {
      messages.push(this.createMessage(i + ": " + searchQuestions[i].text));
    }
    this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, ...messages],
    }));

    this.state = this.DialogStates.KEYWORD_SEARCH;
    this.searchQuestions = searchQuestions;
    this.searchKeywords = keywords;
  }

//#endregion QUESTIONS

//#region LISTINGS

  /**
   * Transistion to listing licenses.
   */
  transitionToListings() {
    this.state = this.DialogStates.LISTINGS;
    this.state.licenses = this.backendInterface.getValidLicenses();

    if (this.state.licenses.length == 0) {
      this.outputSimpleMessage("YOU HAVE NO VALID LICENSES");
      this.outputSimpleMessage("Reply 'reset' to try again...");
      return;
    }

    this.outputSimpleMessage("Here are some licenses I recommend:");
    this.outputSimpleMessage("Navigation_Cmds: prev:_Go_back next:_Go_forward select:_Select_the_license info:_Show_info_on_license");

    this.state.ind = 0;
    this.LISTINGS_outputLicense(this.state.ind, this.state.licenses[this.state.ind]);
  }

  // HELPER FUNCTIONS FOR LISTINGS

  LISTINGS_outputLicense(ind, license) {
    this.outputSimpleMessage(ind + ": " + license.name);
  }

  LISTINGS_outputLicenseInfo(ind, license) {
    var s = "";
    Object.entries(license.properties[0]).forEach(([key, value]) => { s = s + " " + key + ":" + value; });
    this.outputSimpleMessage(s);
  }

  LISTINGS_selectLicense(ind, license) {
    this.backendInterface.selectLicense(license.identifier)
      .then(valid => { this.transitionToFinalState(); });
  }

  /**
   * Special COMMAND responses for license listings
   * 
   * @param {*} msg 
   * @param {*} msg_arr 
   * @param {*} cmd 
   */
  LISTINGS_respondToCommand(msg, msg_arr, cmd) {
    if (this.state.licenses.length == 0) {
      this.GEN_respondToCommand(msg, msg_arr, cmd);
      return;
    }
    if (cmd === 'prev' || cmd === 'last') {
      this.state.ind = (this.state.ind + this.state.licenses.length - 1) % this.state.licenses.length;
      this.LISTINGS_outputLicense(this.state.ind, this.state.licenses[this.state.ind]);
    }
    else if (cmd === 'next') {
      this.state.ind = (this.state.ind + 1) % this.state.licenses.length;
      this.LISTINGS_outputLicense(this.state.ind, this.state.licenses[this.state.ind]);
    }
    else if (cmd === 'info' || cmd === 'information') {
      this.LISTINGS_outputLicenseInfo(this.state.ind, this.state.licenses[this.state.ind]);      
    }
    else if (cmd === 'select' || cmd === 'pick') {
      this.LISTINGS_selectLicense(this.state.ind, this.state.licenses[this.state.ind]);
    } else {
      this.GEN_respondToCommand(msg, msg_arr, cmd);
    }
  }

//#endregion LISTINGS


//#region FINAL

  transitionToFinalState() {
    this.outputSimpleMessage("You have selected a license."); 
    this.outputSimpleMessage("You may check for new dependencies with 'reinit' .");
    this.state = this.DialogStates.FINAL;
  }

  FINAL_respondToCommand(msg, msg_arr, cmd) {
    if (cmd === 'info' || cmd === 'information') {
      const license = this.backendInterface.getSelectedLicense();
      this.outputSimpleMessage("Your license is: " + license);
    } else {
      this.GEN_respondToCommand(msg, msg_arr, cmd);
    }
}

//#endregion FINAL


  /**
   * Handle setting the threshold of the when to list licenses.
   * @param {*} m 
   * @param {*} a 
   * @param {*} an 
   */
  SET_THRESHOLD_setThreshold(m, a, an) {
    this.outputSimpleMessage(`You selected ${an}.`);
    if (an > 0 && an < 11) {
      config.licenseCutOff = an;
      this.askQuestion();
    } else {
      this.outputSimpleMessage("That threshold is not in range.");
    }
  }


//#region KEYWORD_SEARCH

  /**
   * In state KEYWORD_SEARCH,
   * Allow user to select the question from a list.
   * 
   * @param {*} msg 
   * @param {*} msg_arr 
   * @param {*} ind 
   */
  KEYW_respondToQuestionSelect(msg, msg_arr, ind) {
    if (ind < 0 || ind >= this.searchQuestions.length) {
      this.outputSimpleMessage("That number is not a valid question.");
      return;
    }
    // Set the selected question
    this.question = this.searchQuestions[ind];
    this.state = this.DialogStates.QUESTIONS;
    // Output the selected question
    const debugMessage = this.createMessage(`That was a question selected with ${ind}`);
    const qMessage = this.createMessage(this.question.text);
    const messages = [ debugMessage, qMessage ];
    this.setState((prev) => ({
    ...prev,
    messages: [...prev.messages, ...messages ],
    }));
  }

//#endregion KEYWORD_SEARCH




//#region GENERAL_RESPONSE_METHODS

  GEN_respondToCommand(msg, msg_arr, cmd) {
    // Current commands:   cmd_words : ['reinit', 'reset', 'resetq', 'provide_licenses'],

    if (cmd === 'reset') {
      this.outputSimpleMessage("Resetting...");
      this.state = this.DialogStates.WAIT;
      this.backendInterface.resetQuestions()
        .then((validProject) => { 
          if (validProject) {
            this.backendInterface.getDependencyConflicts()
              .then(response => this.INIT_handleProjectResolution());
          } else {
            this.PL_INIT_askProjectLocation("Project disconnected, please provide a valid project path...");
          }
        });
    } 
    
    else if (cmd === 'reinit') {
      this.state = this.DialogStates.WAIT;
      this.outputSimpleMessage("Reintializing your dependencies. This may take a while...");
      this.backendInterface.reinitDependencyChecker()
        .then((hasValidProject) => {
          if (hasValidProject) {
            this.INIT_handleProjectResolution();
          } else {
            this.PL_INIT_askProjectLocation("I could not find a maven file there...");
          }
        });
    }

    else if (cmd == 'licenses') {
      this.transitionToListings();
    }

    else if (cmd == 'threshold') {
      this.state = this.DialogStates.SET_THRESHOLD;
      this.outputSimpleMessage("Set threshold (reply with number between 1 and 11):");
    } 
    
    else if (cmd == 'help') {
      this.outputSimpleMessage("help:_display_this threshold:_set_licenses_cutoff reinit:_reinit_dependencies reset:_reset_questions info:_provide_info explain:_provide_info deps:_show_dependencies"); 
    }

    else if (cmd == 'debug_select') {
      this.state = this.DialogStates.WAIT;
      this.backendInterface.selectLicense("BSD-3-Clause")
        .then(valid => { this.transitionToFinalState(); });
    }

    else if (cmd == 'deps') {
      this.INIT_displayDependencyData();
    }

    else if (cmd == 'info' || cmd == 'information' || cmd == 'explain') {
      if (this.state == this.DialogStates.QUESTIONS) {
        this.outputSimpleMessage(this.question.explain);
      }
    }
  }

//#endregion GENERAL_RESPONSE_METHODS





//#region CONFLICTS 

  /**
   * 
   */
  transitionToDDConflictResolve(ddConflict) {
    this.state = this.DialogStates.INFORM_DEPEND_DEPEND_CONFLICT;

    this.outputSimpleMessage("There are license compliance issues in your project caused by dependencies.");
    const pn = ddConflict.licenses.length > 1 ? "s " : " ";
    const pv = ddConflict.licenses.length > 1 ? " " : "s ";
    this.outputSimpleMessage("The license" + pn + ddConflict.licenses + " conflict" + pv + "with " + ddConflict.conflicts_with);
    this.outputSimpleMessage("The ID of the dependency with " + ddConflict.licenses[0] + " is " + ddConflict.id);
    this.outputSimpleMessage("Please, resolve these issues by removing dependencies that conflict, then reply with 'reinit'.");
  }

  /**
   * 
   * @param {[DependencyAnswerConflict]} adConflicts 
   */
  transitionToDAConflictResolve(adConflicts) {
    this.state = this.DialogStates.INFORM_DEPEND_ANSWER_CONFLICT;
    this.outputSimpleMessage("A new dependency conflicts with your answers to previous questions (or your selected license).");
    const firstConflict = adConflicts[0];
    this.outputSimpleMessage(firstConflict.newly_added_license + " is conflicting with your answers and/or license selection.");
    this.outputSimpleMessage("Remove this dependency then respond with 'Reinit' OR respond with 'Reset' to reset your questions.");
  }

//#endregion CONFLICTS



//#region UTILITIES

  /****** VITAL HELPER METHODS  *******/

  // Called to start asking taxonomy questions, rather than init questions
  askQuestion = () => {
    this.state = this.DialogStates.QUESTIONS;

    const questions = this.backendInterface.getGoodRelevantQuestions();
    // Set first question
    this.question = questions[0];
    console.log(this.question);
    this.state = this.DialogStates.QUESTIONS;
    // Ask first question
    const qMessage = this.createMessage(this.question.text);

    this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, qMessage ],
    }));
  };


  /**************************************************************************
   * ****          UTILITIES                                             ****
   * ************************************************************************/

  shouldTransitionToListings = () => {
    return this.backendInterface.getValidLicenses().length <= config.licenseCutOff
      || this.backendInterface.shouldTransitionToListings();
  }

  // Find keywords for questions here, match them to keywords parameter
  searchQuestionsByKeywords = (keywords) => {
    // sort relevant questions but the number of keyword matches
    const relQuestions = this.backendInterface.getRelevantQuestions();
    const relKeywords = relQuestions.map((q, ind) => {
      return { 
        count: q.getKeywords().filter(w => keywords.includes(w)).length,
        index : ind
      }
    });
    const sortedQs = relKeywords.sort((x, y) => (y.count - x.count));
    return sortedQs.map(q => relQuestions[q.index]);
  }

  // Output simple chat bot message
  outputSimpleMessage = (msg) => {
    const botMessage = this.createMessage(msg);
    this.setState((prev) => ({
    ...prev,
    messages: [...prev.messages, botMessage],
    })); 
  }
  outputWidgetMessage = (msg, wid) => {
    const botMessage = this.createMessage(msg, { widget : wid });
    this.setState((prev) => ({
    ...prev,
    messages: [...prev.messages, botMessage],
    })); 
  }
}
//#endregion UTILITIES



const DialogManager = new DialogManagerClass(BEInterface);

export default DialogManager;