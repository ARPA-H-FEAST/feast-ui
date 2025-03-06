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
            "url": "/gw-feast"
        },
        {
            "id": "faq",
            "label": "FAQ",
            "url": "/gw-feast/static/faq"
        },
        {
            "id": "about",
            "label": "About",
            "url": "/gw-feast/static/about"
        },
        {
            "id": "fhir",
            "label": "FHIR",
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