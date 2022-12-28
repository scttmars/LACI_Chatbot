/**
 * Data class encoding data on software licenses
 */
export class SoftwareLicense {
    /**
     * 
     * @param {number} id 
     * @param {string} name 
     * @param {string} desc 
     */
    
    constructor(id, identifier, name, link, properties) {
        this._id = id;
        this._identifier = identifier;
        this._name = name;
        this._link = link;
        this.properties = properties;
    }

    get id() {
        return this._id;
    }
    /**
     * @param {number} id
     */
    set id(id) {
        this._id = id;
    }
    
    get link() {
        return this._link;
    }
    /**
     * @param {string} link
     */
    set link(link) {
        this._link = link;
    }

    
    get identifier() {
        return this._identifier;
    }
    /**
     * @param {number} identifier
     */
    set identifier(identifier) {
        this._identifier = identifier;
    }

    get name() {
        return this._name;
    }
    /**
     * @param {string} name
     */
    set name(name) {
        this._name = name;
    }

    /** 
    * @returns {string} {id}:{name}
    */
    toString() {
        return `${this.id} : ${this.name}`;
    }
};