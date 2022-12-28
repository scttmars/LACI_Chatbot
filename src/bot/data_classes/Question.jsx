/**
 * Data class encoding data related to 
 */
export class Question {
    constructor(id, text, priority, expl) {
        this._id = id;
        this._text = text;
        this._priority = priority;
        this._expl = expl;
    }

    
    get id() {
        return this._id;
    }
    set id(id) {
        this._id = id;
    }

    get text() {
        return this._text;
    }
    set text(text) {
        this._text = text;
    }
    get explain() {
        return this._expl;
    }
    
    get priority() {
        return this._priority;
    }

    /**
     * Get a list of keywords (all words with length >= 4 from the question's text
     * @returns a list of keywords in the order of their first occurence
     */
    getKeywords() {
        const msg_arr =  this.text.toLowerCase().split(/[,.\s;:"'`?!]+/g);
        return msg_arr.filter(word => word.length >= 4);
    }

    /**
     * Convert the question into a string representation (with ID and text)
     * @returns a string representation of the question
     */
    toString() {
        return `${this.id} : ${this.text}`;
    }
};