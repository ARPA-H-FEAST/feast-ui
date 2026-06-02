export function appConfig() {
    return {
    "dataversion": "1.0",
    "logo": "GW Data Commons",
    "search_examples": "Example queries: nbcc, gw, prostate",
    "webroot": "/gwdc",
    "headerlinks": [
        {
            "id": "home",
            "label": "Home",
            "url": "/gwdc/browse"
        },
        {
            "id": "faq",
            "label": "FAQ",
            "url": "https://hivelab.biochemistry.gwu.edu/wiki/GW-FEAST_Frequently_Asked_Questions_(FAQ)"
        },
        {
            "id": "about",
            "label": "About",
            "url": "https://hivelab.biochemistry.gwu.edu/wiki/GW-FEAST"
        },
        {
            "id": "fhir",
            "label": "SMART on FHIR",
            "url": "/gwdc/fhir-interface"
        },
        {
            "id": "mutation",
            "label": "dbGaP Analytics",
            "url": "/gwdc/mutation-dashboard"
        },
    ],
    "fileuploadformats": [],
    "fileuploadqc": [],
    "footer": {
        "links": [
            {
                "label": "License",
                "url": "/gwdc/static/license"
            },
            {
                "label": "Privacy Policy",
                "url": "/gwdc/static/privacy/"
            },
            {
                "label": "Disclaimer",
                "url": "/gwdc/static/disclaimer/"
            },
            {
                "label": "Contact Us",
                "url": "/gwdc/static/contactus/"
            }
        ],
        "license": "",
        "funding": "Funded by ....",
        "logos": [
            "/imglib/logo-gwu.png",
            // "/imglib/temple.png",
            // "/imglib/embleema.png"
        ]
    },
    "versionlist": [
        "1.0"
    ]
  }
}