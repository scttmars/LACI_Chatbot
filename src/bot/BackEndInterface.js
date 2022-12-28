import LicenseObjs from "./data_classes/LicenseList";
import { Question } from "./data_classes/Question";
import QuestionsList from "./data_classes/QuestionsList";
import { SoftwareLicense } from "./data_classes/SoftwareLicense";

/**
 * Interfaces with the backend and handles/stores responses appropriately.
 * 
 * Questions : parsed from json list into Question objects, sorted by priority
 * Licenses  : Can be as is but i'd prefer same structure as Questions
 * Conflicts : Returned as pair, preventing license and prevented licenses 
 * 
 */
class BackEndInterface {

  constructor() {
    this.shouldTransition = false;
  }

  /**
  * Get only questions for which an answer will filter (only) some of the licenses on an answer.
  * !!! Assumed to be sorted by priority !!!
  * @returns {Question[]}
  */
  getGoodRelevantQuestions() {
    return this.good_questions;
  }

  /**
  * Get only questions which have not been asked.
  * !!! Assumed to be sorted by priority !!!
  * @returns {Question[]}
  */
  getRelevantQuestions() {
    return this.questions;
  }

  /** 
   * Get licenses filtered by the requirements of the project and user
   * @returns {SoftwareLicense[]} List of licenses
   */ 
  getValidLicenses() {
    return this.licenses;
  }


  /**
   * Get the file path of the dependencies
   * @returns {string|undefined} The location of the dependencies file or undefined if no such file
   * It should return undefined if it has no stored file path OR if the file path cannot be followed to a file.
   */
  getDependencyLocation() {
    return this.project.path;
  }

  /**
   * Get the selected license
   * @returns Selected license
   */
  getSelectedLicense() {
    return this.selectedLicense;
  }

  getDependencies() {
    return this.dependencies;
  }

  /**
   * 
   * 
   * @param {*} data Project data
   * @returns True iff project path is valid
   */
  isValidProject(data) {
    return data.path != "";
  }
  
  /**
   * Handle the backend's response to an answered question
   * @param {*} response 
   * @returns {Bool} Returns true if successful answering
   */
  handleQuestionResponse(response) {
    this.loadProjectData(response);
    return this.isValidProject(response);
  }

  /**
   * Load the data sent from the backend and parse/filter it appropriately
   * 
   * @param {*} data Project data sent from backend
   */
  loadProjectData(data) {
    console.log(data);
    
    if (this.isValidProject(data)) {
      this.project = data;

      const questions = data.questions.filter(q => !data.answered.includes(q.id) && QuestionsList[q.id].licenseField != "");
      
      this.questions = questions.map(q => new Question(q.id, QuestionsList[q.id].text, q.priority, QuestionsList[q.id].explanation));
      // TODO : old sort is to comment this out, new sort is uncomment this
      this.questions.sort((a,b) => { 
        if (a.priority < b.priority) return -1; 
        if (a.priority > b.priority) return 1;
        if (a.id < b.id) return -1; 
        if (a.id > b.id) return 1;
        return 0;
      });
      console.log(data.poor_questions);
      this.good_questions = this.questions.filter(q => !data.poor_questions.includes(q.id));
      console.log("GOOD QUESTIONS:");
      console.log(this.good_questions);

      this.shouldTransition = (this.good_questions.length == 0);

      this.licenses = data.licenses.map(l => 
        new SoftwareLicense(LicenseObjs[l].id, l, LicenseObjs[l].name, 
                            LicenseObjs[l].link, LicenseObjs[l].properties));

      this.conflicts = data.conflicts;
      this.selectedLicense = data.selected_license;

      this.dependencies = data.dependencies;
        
    } else {
      this.questions = [];
      this.selectedLicense = "";
      this.licenses = [];
      this.conflicts = [];
      this.project = {};
      this.dependencies = {};
    }
  }

  /**
   * In future work, the backend could determine when to show the user licenses.
   * 
   * @returns False
   */
  shouldTransitionToListings() {
    return this.shouldTransition;
  }
  

  /** 
   * SENDS DATA TO BACKEND
   * Set the answer to a question and update the valid licenses
   * @param {number} id 
   * @param {char} answer 'Y', 'N', or 'M' 
   * @returns {Promise<Bool>} Promise for a boolean of whether answer was successful
   */ 
    answerQuestion(id, answer) {
    console.log(`User answered question ${id} with ${answer}.`);
      if (answer != "M") {
        // Y/N
        return fetch('answer', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id : id, answer : answer })
        })
        .then(response => response.json())
        .then(response => this.handleQuestionResponse(response));
    } else {
      // M
      console.log("Skipped question.");
      return fetch('skipQuestion', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id : id, answer : answer })
    })
    .then(response => response.json())
    .then(response => this.handleQuestionResponse(response));
    }
  }

  /**
   * SENDS DATA TO BACKEND
   * Get the conflicts for the project.
   *  
   * @returns {Promise<Bool>} Promise for a boolean of whether GET was successful
   */
  getDependencyConflicts() {
    return fetch('getConflicts', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
  })
  .then(response => response.json())
  .then(response => { this.loadProjectData(response); return response; });
  }

  /**
   * SENDS TO BACKEND
   * Sends a message to select a license to the backend, by ID.
   * d
   * @param {int} id The ID of the license to select
   * @returns {Promise<Bool>} Promise for a boolean of whether selection was successful
   */
  selectLicense(id) {
    console.log(`User selected license with ${id}.`);

    return fetch('setLicense', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(response => { this.loadProjectData(response); return response; })
    .then(response => this.isValidProject(response));
  }


  /** 
   * SENDS TO BACKEND
   * Ask the server to send over its project data.
   * 
   * @returns {Promise<Bool>} Promise for a boolean of whether project requerst was successful
   */
  makeProjectRequest() {
    return fetch('requestProject', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type : "request_full" })
    })
    .then(response => response.json())
    .then(response => { 
      this.loadProjectData(response);
      return this.isValidProject(response);
    });
  }

  /**
   * SENDS TO BACKEND
   * Send the server a project path.
   * Expect a LONG response latency.
   *
   * @param {str} path 
   * @returns {Promise<Bool>} Promise for a boolean of whether project path is valid
   */
  setProjectPath(path) {
    return fetch('setPath', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "path": path })
    })
    .then(response => response.json())
    .then(response => { 
      this.loadProjectData(response);
      return this.isValidProject(response);
    });
  }

  /**
   * SENDS TO BACKEND
   * Send to server that all questions should be reset
   * 
   * @returns {Promise<Bool>} Promise for a boolean of whether project is valid after reset
   */
  resetQuestions() {
    return fetch('resetQs', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type : "resetQs" })
    })
    .then(response => response.json())
    .then(response => { 
      this.loadProjectData(response);
      return this.isValidProject(response);
    });
  }

  /**
   * SENDS TO BACKEND.
   * Send to server that it should reinitialize its dependency checker.
   * Expect a LONG response latency.
   * 
   * @returns {Promise<Bool>} Promise for a boolean of whether project is valid after reset
   */
  reinitDependencyChecker() {
    return fetch('reInitMaven', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type : "reinit" })
    })
    .then(response => response.json())
    .then(response => { 
      this.loadProjectData(response);
      return this.isValidProject(response);
    });
  }
}

const BEInterface = new BackEndInterface();

export default BEInterface;