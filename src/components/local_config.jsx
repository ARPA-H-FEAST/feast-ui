//import * as Zulamodule from "./module_exports";

export const apiHash = {
    dataset_init: process.env.REACT_APP_API_URL + "/init/",
    dataset_search: process.env.REACT_APP_API_URL + "/search/",
    dataset_list: process.env.REACT_APP_API_URL + "/list/",
    dataset_detail: process.env.REACT_APP_API_URL + "/detail/",
    dataset_image: process.env.REACT_APP_API_URL + "/image/",
    dataset_curation: process.env.REACT_APP_API_URL + "/curation/",
    dataset_savecuration: process.env.REACT_APP_API_URL + "/savecuration/",
    dataset_download: process.env.REACT_APP_API_URL + "/download/",
    dataset_upload: process.env.REACT_APP_API_URL + "/upload/",
    dataset_submit: process.env.REACT_APP_API_URL + "/submit/",
    dataset_glycan_finder: process.env.REACT_APP_API_URL + "/glycan_finder/",
    dataset_history_list: process.env.REACT_APP_API_URL + "/historylist/",
    dataset_history_detail: process.env.REACT_APP_API_URL + "/historydetail/",
    dataset_static_content: process.env.REACT_APP_API_URL + "/pagecn/",
    user_login_direct:process.env.REACT_APP_SMART_URL + "/users/login/",
    user_logout:process.env.REACT_APP_SMART_URL + "/users/logout/",
    user_info:process.env.REACT_APP_SMART_URL + "/users/whoami/",
    // init_info:process.env.REACT_APP_SMART_URL + "/users/init/",
    oauth_user_info:process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/userinfo/",
    fhir_endpoint: process.env.REACT_APP_SMART_URL + "/api/"
};


