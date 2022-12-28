
from bs4 import BeautifulSoup
import pprint, os, json

class License():

    def __init__(self, name, url):
        self._name = name
        self._url = url

    def getName(self): return self._name

    def getUrl(self): return self._url

    def __repr__(self):
        return self._name

    def toJson(self):
        return {"name":self._name, "url":self._url}

class Artifact():

    def __init__(self, aid, url):
        self._id = aid
        self._url = url

    def getId(self): return self._id

    def getUrl(self): return self._url

    def __repr__(self):
        return self._id

    def toJson(self):
        return {"ID":self._id, "url":self._url}

class Dependency():

    def __init__(self, gid=None, aid=None, licenses=None, version=None):
        self._groupId    = gid
        self._licenses   = licenses
        self._artifactId = aid
        self._version    = version

    def toJson(self):
        return {"groupID":self._groupId,
                "licenses":[l.toJson() for l in self._licenses],
                "artifact":self._artifactId.toJson(),
                "version":self._version}

    def setGroupId(self, groupId):
        self._groupId = groupId

    def setLicenses(self, licenses):
        self._licenses = licenses

    def setArtifactId(self, artifactId):
        self._artifactId = artifactId

    def setVersion(self, version):
        self._version = version

    def getVersion(self): return self._version
    
    def getLicenses(self): return self._licenses
    
    def getArtifactId(self): return self._artifactId
    
    def getGroupId(self): return self._groupId

    def __repr__(self):
        return str(self._artifactId)

def getSection(d, section, heading):
    divs = d.find_all("div")
    for div in divs:
        if div.get("class", [0])[0] == "section":
            h = div.find(heading)
            if h and h.get_text() == section:
                return div

def packageDependency(row):
    d = row.find_all("td")     
    dep = Dependency() 
    dep.setGroupId(d[0].get_text())
    dep.setVersion(d[2].get_text())   
    art = Artifact(d[1].get_text(), d[1].find("a").get("href"))
    dep.setArtifactId(art)  
    licenses = [License(a.get_text(), a.get("href")) for a in d[4].find_all("a")]
    dep.setLicenses(licenses)
    return dep

def getDataFromTable(section):
    if section == None: return []
    data = []
    table = section.find("table")
    for row in table.find_all("tr")[1:]:
        dep = packageDependency(row)
        data.append(dep)
    return data

def parseFile(filename):
    
    with open(filename, "r") as file:
        soup = BeautifulSoup(file, 'html.parser')
    
    div = getSection(soup, "Project Dependencies", "h2")
    jsonData = {}
    getDependencies(div, "compile", jsonData)
    getDependencies(div, "test", jsonData)
    exportAsJson(jsonData)

def getDependencies(div, section, json):
    sec = getSection(div, section, "h3")
    d = getDataFromTable(sec)
    json[section] = [item.toJson() for item in d]

def exportAsJson(data):
    with open('data.json', 'w') as file:
        json.dump(data, file)
    

if __name__ == "__main__":
    filepath = os.path.join(os.getcwd(), "target", "site", "dependencies.html")
    parseFile(filepath)

