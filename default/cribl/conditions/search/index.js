exports.name="Search Condition";exports.type="search";exports.category="search";let notificationId;exports.init=i=>{notificationId=i.conf.__notificationId};exports.build=()=>({filter:`id.startsWith('SEARCH_NOTIFICATION_${notificationId}')`,pipeline:{conf:{functions:[]}}});