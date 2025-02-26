//import * as Zulamodule from "./module_exports";

export const apiHash = {
    dataset_init:process.env.REACT_APP_API_URL + "/dataset/init",
    dataset_search:process.env.REACT_APP_API_URL + "/dataset/search",
    dataset_list:process.env.REACT_APP_API_URL + "/dataset/list",
    dataset_detail:process.env.REACT_APP_API_URL + "/dataset/detail",
    dataset_image:process.env.REACT_APP_API_URL + "/dataset/image",
    dataset_curation:process.env.REACT_APP_API_URL + "/dataset/curation",
    dataset_savecuration:process.env.REACT_APP_API_URL + "/dataset/savecuration",
    dataset_download:process.env.REACT_APP_API_URL + "/dataset/download",
    dataset_upload:process.env.REACT_APP_API_URL + "/dataset/upload",
    dataset_submit:process.env.REACT_APP_API_URL + "/dataset/submit",
    dataset_glycan_finder:process.env.REACT_APP_API_URL + "/dataset/glycan_finder",
    dataset_history_list:process.env.REACT_APP_API_URL + "/dataset/historylist",
    dataset_history_detail:process.env.REACT_APP_API_URL + "/dataset/historydetail",
    dataset_static_content:process.env.REACT_APP_API_URL + "/dataset/pagecn",
    user_login_direct:process.env.REACT_APP_USER_URL + "/users/login/",
    user_logout:process.env.REACT_APP_USER_URL + "/users/logout/",
    user_info:process.env.REACT_APP_USER_URL + "/users/whoami/",
    // init_info:process.env.REACT_APP_USER_URL + "/users/init/",
    oauth_user_info:process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/userinfo/"
};


