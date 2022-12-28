const QuestionsList = [
    {
        "id" : 0,
        "text" : "Do you want a copy left license?",
        "priority" : 1,
        "licenseField" : "CopyLeft",
        "explanation" : "Copyleft means that software can freely uses or modify your project so long as it guarentees the same rights/privileges.",
        "response" : ""
    },
    { "id" : 1, "text" : "DUMMY" },
    {
        "id" : 2,
        "text" : "Would you like a strong copyleft license?",
        "priority" : 2,
        "licenseField" : "CopyLeft",
        "explanation" : "Strong copyleft means that software can freely uses or modify your project so long as derivate works use the same license.",
        "response" : ""
    },
    {
        "id" : 3,
        "text" : "Do you want a GPL compatible license?",
        "priority" : 3,
        "licenseField" : "GPLCompatible",
        "explanation" : "A license which is compatible with the GPL license; it does not restrict beyond the restrictions of GPL.",
        "response" : ""
    },
    {
        "id" : 4,
        "text" : "Do you want an apache compatible license?",
        "priority" : 3,
        "licenseField" : "ApacheCompatible",
        "explanation" : "A license which is compatible with the Apache license; it does not restrict beyond the restrictions of Apache.",
        "response" : ""
    },
    {
        "id" : 5,
        "text" : "Do you want a BSD compatible license?",
        "priority" : 3,
        "licenseField" : "BSDComaptible",
        "explanation" : "A license which is compatible with the BSD license; it does not restrict beyond the restrictions of BSD.",
        "response" : ""
    },
    {
        "id" : 6,
        "text" : "Do you want to be able to edit the codebase in the future?",
        "priority" : 2,
        "licenseField" : "ModifyCode",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 7,
        "text" : "Do you plan to sell software from this codebase?",
        "priority" : 2,
        "licenseField" : "RedistributeForProfit",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 8,
        "text" : "Do you want to publish your software?",
        "priority" : 2,
        "licenseField" : "PrivateDistribution",
        "explanation" : "Publishing refers to distributing your software to be installed locally on computers.",
        "response" : ""
    },
    {
        "id" : 9,
        "text" : "Do you want to distribute binaries?",
        "priority" : 3,
        "licenseField" : "Binaries",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 10,
        "text" : "Do you want a license that comes with a patent grant?",
        "priority" : 4,
        "licenseField" : "PatentGrant",
        "explanation" : "A patent grant prohibits others from using or selling the patented code without your permission.",
        "response" : ""
    },
    {
        "id" : 11,
        "text" : "Do you want a license that comes with a trademark grant?",
        "priority" : 4,
        "licenseField" : "TrademarkGrant",
        "explanation" : "A patent grant prohibits others from using or selling the patented code without your permission.",
        "response" : ""
    },
    {
        "id" : 12,
        "text" : "Are you altering another codebase?",
        "priority" : 4,
        "licenseField" : "",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 13,
        "text" : "Do you want other people to be able to modify and use your codebase?",
        "priority" : 2,
        "licenseField" : "ModifyCode",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 14,
        "text" : "Do you want other people to be able to create derivative works?",
        "priority" : 3,
        "licenseField" : "DerivativeWorks",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 15,
        "text" : "Do you want to use an opensource license?",
        "priority" : 1,
        "licenseField" : "",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 16,
        "text" : "Do you want the license to be simple and permissive?",
        "priority" : 3,
        "licenseField" : "",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 17,
        "text" : "Do you want your software to be able to do whatever they want with the project except distribute closed source versions?",
        "priority" : 4,
        "licenseField" : "PublicDistribution",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 18,
        "text" : "Is the project based on existing software?",
        "priority" : 3,
        "licenseField" : "",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 19,
        "text" : "Is your code used directly as an executable file?",
        "priority" : 3,
        "licenseField" : "Binaries",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 20,
        "text" : "Is your code used as a library?",
        "priority" : 3,
        "licenseField" : "",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 21,
        "text" : "Would you like to see possible licenses?",
        "priority" : 3,
        "licenseField" : "",
        "explanation" : "This is not a valid question, why is it here...",
        "response" : ""
    },
    { "id" : 22, "text" : "DUMMY" },
    {
        "id" : 23,
        "text" : "Do you own the entire codebase?",
        "priority" : 0,
        "licenseField" : "",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 24,
        "text" : "Are you okay including a copyright?",
        "priority" : 1,
        "licenseField" : "MustIncludeCopyright",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 25,
        "text" : "Do you want to use the same license for the entire work?",
        "priority" : 2,
        "licenseField" : "SameLicense",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 26,
        "text" : "Are you okay with someone profitting from derivative works?",
        "priority" : 3,
        "licenseField" : "DerivativeWorksForProfit",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 27,
        "text" : "Do you want modified source code to be required to be published?",
        "priority" : 3,
        "licenseField" : "DistributeSource",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 28,
        "text" : "Do you want the license to be included in all files?",
        "priority" : 4,
        "licenseField" : "IncludedInFiles",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 29,
        "text" : "Do you want the license to be included in all files?",
        "priority" : 4,
        "licenseField" : "IncludedInFiles",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 30,
        "text" : "Do you want a BSD compatible license?",
        "priority" : 3,
        "licenseField" : "BSDComaptible",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 31,
        "text" : "Do you want to be able to make a derivative license?",
        "priority" : 4,
        "licenseField" : "DerivativeLicense",
        "explanation" : "",
        "response" : ""
    },
    {
        "id" : 32,
        "text" : "Do you want a debian compatible license?",
        "priority" : 5,
        "licenseField" : "DebianFSGCompatible",
        "explanation" : "",
        "response" : ""
    }


]

export default QuestionsList;