import xml.etree.ElementTree as ET
import os

outputFile = "test.xml"

def getTagName(element):
    s = element.tag.split("}")
    if len(s) == 2: return s[1]
    else: return s[0]

def addPlugin():
    tree = ET.parse("pom.xml")
    root = tree.getroot()
    insertSitePlugin(tree, root)

def insertSitePlugin(tree, root):
    for c in root:
        if getTagName(c) == "build":
             for el in c:
                 if getTagName(el) == "pluginManagement":
                     for e in el:
                         if getTagName(e) == "plugins":
                     
                            node = ET.SubElement(e, 'plugin')
                            aid = ET.SubElement(node, 'artifactId')
                            aid.text = 'maven-site-plugin'
                            version = ET.SubElement(node, 'version')
                            version.text = '3.7.1'
                            tree.write(outputFile)

def makeFile(name):
    file = open(name, "w")
    file.close()

def checkPOM():
    makeFile(outputFile)
    with open("pom.xml", "r") as file:
        lines = file.read()
        if not "maven-site-plugin" in lines:
            addPlugin()
            with open(outputFile, "r") as file:
                lines = file.read().replace("ns0:", "")
            with open(outputFile, "w") as file:
                file.write(lines)


#### Add the maven-site-plugin if it isn't included in the POM
##checkPOM()
##
#### Run site command to generate information
##os.system("mvn site")
##
#### Extract licensing information from generated files
##filepath = os.path.join(os.getcwd(), "target", "site", "dependencies.html")
##parser.parseFile(filepath)

