TRANSLATIONS = {
    "Home": "गृहपृष्ठ",
    "Ministries": "मन्त्रालयहरू",
    "Districts": "जिल्लाहरू",
    "Revenue": "राजस्व",
    "Projects": "आयोजनाहरू",
    "Outcomes": "नतिजाहरू",
    "Total Budget": "कुल बजेट",
    "Capital Budget": "पूँजीगत बजेट",
    "Own-source Revenue": "आन्तरिक राजस्व",
    "Per Citizen Spending": "प्रति नागरिक खर्च",
    "Federal Dependency": "संघीय निर्भरता",
    "Federal Grant": "संघीय अनुदान",
    "Federal": "संघीय",
    "Own": "आन्तरिक",
    "Loan": "ऋण",
    "Budget": "बजेट",
    "Spent": "खर्च",
    "Progress": "प्रगति",
    "Status": "स्थिति",
    "Population": "जनसंख्या",
    "Allocation": "विनियोजन",
    "Percentage": "प्रतिशत",
    "Ongoing": "जारी",
    "Delayed": "ढिलाइ",
    "Completed": "सम्पन्न",
    "Planning": "योजना",
    "Priority Zone": "प्राथमिकता क्षेत्र",
    "Standard": "मानक",
    "Education": "शिक्षा",
    "Health": "स्वास्थ्य",
    "Infrastructure": "पूर्वाधार",
    "Agriculture": "कृषि",
}

def t(word):
    return TRANSLATIONS.get(word, "")

def bilingual(word):
    nep = TRANSLATIONS.get(word)
    return f"{word} ({nep})" if nep else word