export function appConfig() {
    return {
    "dataversion": "1.0",
    "logo": "FEAST",
    "search_examples": "Example queries: nbcc, gw, prostate",
    "webroot": "/gw-feast",
    "headerlinks": [
        {
            "id": "home",
            "label": "Home",
            "url": "/gw-feast/browse"
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
            "url": "/gw-feast/fhir-interface"
        },
    ],
    "fileuploadformats": [],
    "fileuploadqc": [],
    "footer": {
        "links": [
            {
                "label": "License",
                "url": "/gw-feast/static/license"
            },
            {
                "label": "Privacy Policy",
                "url": "/gw-feast/static/privacy/"
            },
            {
                "label": "Disclaimer",
                "url": "/gw-feast/static/disclaimer/"
            },
            {
                "label": "Contact Us",
                "url": "/gw-feast/static/contactus/"
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