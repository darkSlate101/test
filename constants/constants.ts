export const roles = ['guest', 'user', 'functionAdmin', 'orgAdmin'];

export const functions = [
    'transformationRoadmap',
    'progressBoard',
    // 'retrospectiveBoard',
    'projects',
    'roadmap',
    'blog',
    'colab',
    // 'pages',
    'myApps',
    'pin',
];

export const functionsDefaultAccess = {
    guest: {
        read: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages']
    },
    user: {
        create: ['blog', 'pages'],
        read: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages'],
        update: ['progressBoard', 'retrospectiveBoard', 'blog', 'pages'],
        delete: ['blog', 'pages']
    },
    functionAdmin: {
        create: [],
        read: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages'],
        update: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages', 'myApps', 'pin'],
        delete: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages', 'myApps', 'pin']
    },
    orgAdmin: {
        create: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages', 'myApps', 'pin'],
        read: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages', 'myApps', 'pin'],
        update: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages', 'myApps', 'pin'],
        delete: ['transformationRoadmap', 'progressBoard', 'retrospectiveBoard', 'blog', 'pages', 'myApps', 'pin']
    }
};

export const defaultPersonalAccess = functions.map(el => ({ name: el, roles: ['user'], for: ['home'] }));

export const defaultProjectFunctionsAccess = functions.map(el => ({ name: el, roles: ['user'] }));

export const defaultOrgAdminPersonalAccess = functions.map(el => ({ name: el, roles: ['orgAdmin'], for: ['home', 'projects'] }));


export const defaultConfig = {
    "title": "Pivitle 360",
    "contactAdministrationMessage": "Contact Administrators Message Please enter information about your request for the site administrators. If you are reporting an error please be sure you include information  on what you were doing and the time the problem occurred.",
    "DojoNonFunctionMessage": "Dojo Non-Functionalities Message Dojo functionalities are currently inactive. If you would like Dojo turned on to utilize Pivitle 360’s full functionalities, please contact your  administrator.",
    "formatting": {
        "indexingLanguage": "English",
        "time": "H:mm a",
        "dateTime": "MMM dd, yyyy HH:mm",
        "date": "MMM dd, yyyy",
        "longNumber": "#################",
        "decimalNumber": "#################.##########"
    },
    "attachments": {
        "maxSize": "100.00MB"
    },
    "connection": {
        "timeout": "10000ms"
    }
};

export const defaultFunctions = functions.map(el => ({ name: el, for: ['home'], plan: 'Standard' }));