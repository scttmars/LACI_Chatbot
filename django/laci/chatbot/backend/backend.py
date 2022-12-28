
import json, os, pprint
from .dependencyCheck.composer import checkPOM
from .dependencyCheck.parser import parseFile

LICENSES = ["Apache-2.0", "BSD-3-Clause", "BSD-2-Clause", "GPL-2.0", "GPL-3.0",
            "LGPL-2.0", "LGPL-3.0", "MIT", "MPL-2.0", "CDDL-1.0", "EPL-2.0"]

class Backend():

    _INSTANCE = None

    @classmethod
    def getInstance(cls):
        if cls._INSTANCE == None:
            cls._INSTANCE = cls._HIDDEN()
        return cls._INSTANCE

    class _HIDDEN():
        
        def __init__(self):

            with open(os.path.join("chatbot","backend",
                                   "resources","licenses.JSON"), "r") as file:
                self._license_data, self._namemap = self.parseLicenseData(json.load(file))


            with open(os.path.join("chatbot","backend",
                                   "resources","questions.JSON"), "r") as file:
                self._question_data, self._question_priority = self.parseQuestionData(json.load(file))
            
            self._path = ""
            self._dependencies = []
            self._valid_licenses = set(LICENSES)
            self._questions_asked = []
            self._license = None
            self._conflicts = []
            self._selected_conflicts = []
            self._poor_questions = []

            self.update_poor_questions()


        def resetState(self):
            self.resetQuestions()
            self._valid_licenses = set(LICENSES)
            self.checkForDependencies()
            self.filterOnDependencies()

        def setLicense(self, lic):
            self._license = lic

        def getLicense(self):
            return self._license
        
        def resetQuestions(self):
            self._questions_asked = []
            self._poor_questions = []

        def setPath(self, path):
            self._path = path

        def getPath(self):
            return self._path

        def returnState(self):
            state = {}
            state["licenses"] = sorted(list(self._valid_licenses))
            state["path"] = self._path
            state["dependencies"] = self._dependencies
            state["questions"] = [{"id":k, "priority":v}
                                 for k,v in self._question_priority.items()]
            
            state["answered"] = self._questions_asked
            state["poor_questions"] = self._poor_questions
            state["conflicts"] = self._conflicts
            state["selected_lic_conflicts"] = self._selected_conflicts
            state["selected_license"] = self._license if self._license != None else ""
            return state

        def getDependencies(self):
            return self._dependencies

        def getConflicts(self):
            
            dependencies = []
            licenses = set()
            for category in self.getDependencies():
                for d in self.getDependencies()[category]:
                    temp = {self.getShortName(lic["name"]) for lic in d["licenses"]}
                    dependencies.append({"id":d["artifact"]["ID"],
                                         "url":d["artifact"]["url"],
                                         "licenses":list(temp)})
                    licenses |= temp
            licenses = {lic for lic in licenses if lic in LICENSES}
            
            conflicts = set()
            sel_lic = self.getLicense()
            selected_license_conflicts = set()
            if any(["BSD" in lic for lic in licenses]):
                for lic in licenses:
                    if self._license_data["BSDCompatible"][lic] == "N":
                        conflicts.add((lic, "BSD"))
                
                if sel_lic in self._license_data["BSDCompatible"]\
                  and self._license_data["BSDCompatible"][lic] == "N": 
                    selected_license_conflicts.add(*[lic for lic in licenses if "BSD" in lic])

                        
            if any(["GPL" in lic for lic in licenses]):
                for lic in licenses:
                    if self._license_data["GPLCompatible"][lic] == "N":
                        conflicts.add((lic, "GPL"))
                
                if sel_lic in self._license_data["GPLCompatible"]\
                  and self._license_data["GPLCompatible"][lic] == "N": 
                    selected_license_conflicts.add(*[lic for lic in licenses if "GPL" in lic])
       
            if any(["Apache" in lic for lic in licenses]):
                for lic in licenses:
                    if self._license_data["ApacheCompatible"][lic] == "N":
                        conflicts.add((lic, "Apache"))
                
                if sel_lic in self._license_data["ApacheCompatible"]\
                  and self._license_data["ApacheCompatible"][lic] == "N": 
                    selected_license_conflicts.add(*[lic for lic in licenses if "Apache" in lic])

            self._conflicts = []
            self._selected_conflicts = list(selected_license_conflicts)
            for c, conflict_type in conflicts:
                for d in dependencies:
                    if c in d["licenses"]:
                        d["conflicts_with"] = conflict_type
                        self._conflicts.append(d)
            
        def hasValidPath(self):
            return self._path != ""

        def checkForDependencies(self):
            if self.hasValidPath():
                try:
                    directory = os.getcwd()
                    os.chdir(self._path)
                    checkPOM()
                    os.system("mvn site")
                    filepath = os.path.join(self._path, "target", "site", "dependencies.html")
                    parseFile(filepath)
                    with open("data.json", "r") as file:
                        self._dependencies = json.load(file)
                    os.chdir(directory)
                except Exception as e:
                    print(e)

        def getShortName(self, long_name):
            return self._namemap.get(long_name,long_name)

        def checkDependencies(self):
            removeLic = []
            used_licenses = set()
            for category in self.getDependencies():
                for d in self.getDependencies()[category]:
                    licenses = {lic["name"] for lic in d["licenses"]}
                    licenses = [self.getShortName(l) for l in licenses]
                    used_licenses |= {l for l in licenses if l != ""}

            # If the answer isn't strictly yes, then filter it out for the time being        
            for lic in used_licenses:
                if "BSD" in lic:
                    removeLic.extend(self.checkProperty("BSDCompatible", "Y"))
                elif "GPL" in lic:
                    removeLic.extend(self.checkProperty("GPLCompatible", "Y"))
                elif "Apache" in lic:
                    removeLic.extend(self.checkProperty("ApacheCompatible", "Y"))
            return set(removeLic)

        def filterOnDependencies(self):
            invalid = self.checkDependencies()
            self._valid_licenses -= invalid
                            
        def getNextQuestionId(self):
            nextQuestion = ""
            lowestPriority = 100
            for qid in self._question_data.keys():
                if qid not in self._questions_asked:
                    if self._question_priority[qid] < lowestPriority:
                        lowestPriority = self._question_priority[qid]
                        nextQuestion = qid
            self._questions_asked.append(nextQuestion)
            return nextQuestion

        def skipQuestion(self, qid):
            self._questions_asked.append(qid)

        def getQuestionField(self, quesitionId):
            return self._question_data[quesitionId]

        def update_poor_questions(self):
            self._poor_questions = []
            for q_key in self._question_data:
                field = self.getQuestionField(q_key)
                if q_key in self._questions_asked: continue
                if field == "": continue
                
                invalid = self.checkProperty(field, "Y")
                yes_dir = len(invalid) == len(self._valid_licenses)
                invalid = self.checkProperty(field, "N")
                no_dir = len(invalid) == len(self._valid_licenses)
                if yes_dir or no_dir:
                    self._poor_questions.append(q_key)


        def filterOnQuestion(self, questionID, answer):
            field = self.getQuestionField(questionID)
            print("Answered question", field, "with", answer)
            invalid = self.checkProperty(field, answer)
            self._valid_licenses -= invalid
            self._questions_asked.append(questionID)
            self.update_poor_questions()

        def checkProperty(self, field, desiredAns):
            notValidLicenses = []
            for lic in self._valid_licenses:
                ans = self._license_data[field][lic]
                if ans != desiredAns:
                    notValidLicenses.append(lic)
            return set(notValidLicenses)

        def parseLicenseData(self, d):

            propertiesStrings = ["MustIncludeCopyright","SameLicense","ModifyCode",
                     "DerivativeWorks","DerivativeWorksForProfit","RedistributeForProfit",
                     "GPLCompatible","Binaries","DistributeSource","CopyLeft","IncludedInFiles",
                     "PublicDistribution","PrivateDistribution","BSDCompatible","ApacheCompatible",
                     "DerivativeLicense","PatentGrant","TrademarkGrant","OSIApproved","FSFApproved",
                     "DebianFSGCompatible","id"]

            properties  = {p:{} for p in propertiesStrings}
            nameMapping = {} 

            for licen in d["licenses"]:
                name = licen["identifier"]
                idVal = licen["id"]
                nameMapping[licen["in_maven"]] = name 
                for prop, value in licen["properties"].items():
                    if prop != "id":
                        properties[prop].update({name : value})
                    else:
                        properties[prop].update({name: idVal})
            return properties, nameMapping

        def parseQuestionData(self, d):
            questions, priority = {}, {}
            for question in d["question"]:
                qid = question["id"]
                prior = question["priority"]
                licenseField = question["licenseField"]
                questions.update({qid : licenseField})
                priority.update({qid : prior})
            return questions, priority
        
        

BACKEND = Backend.getInstance()


## A Singleton instance that holds a dictionary of backends
## Potentially allows for multiple users in the future
##class Backends():
##
##    _INSTANCE = None
##
##    @classmethod
##    def getInstance(cls):
##        if cls._INSTANCE == None:
##            cls._INSTANCE = cls._HIDDEN()
##        return cls._INSTANCE
##
##    class _HIDDEN():
##
##        def __init__(self):
##            self._backends = {}
##
##        def add(self, k, back):
##            self._backends[k] = back
##
##        def get(self, k):
##            return self._backends.get(k, None)


            
